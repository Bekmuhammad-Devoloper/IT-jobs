import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const initData = new URLSearchParams(token);
      const hash = initData.get('hash');
      initData.delete('hash');

      const dataCheckString = Array.from(initData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const botToken = this.configService.get<string>('BOT_TOKEN')!;
      const secretKey = createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
      const computedHash = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      if (computedHash !== hash) {
        throw new UnauthorizedException('Invalid Telegram auth data');
      }

      const userData = JSON.parse(initData.get('user') || '{}');

      let user = await this.prisma.user.findUnique({
        where: { telegramId: BigInt(userData.id) },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: BigInt(userData.id),
            username: userData.username,
            firstName: userData.first_name,
            lastName: userData.last_name,
          },
        });
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid auth data');
    }
  }
}
