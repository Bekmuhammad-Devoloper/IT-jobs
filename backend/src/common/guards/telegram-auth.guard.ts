import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    // JWT Bearer token auth
    if (authHeader.startsWith('Bearer ')) {
      return this.validateJwt(request, authHeader.replace('Bearer ', ''));
    }

    // Telegram initData auth
    const token = authHeader.replace(/^tma /i, '');
    return this.validateTelegramInitData(request, token);
  }

  private async validateJwt(request: any, token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'yuksalish-secret'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub || payload.userId },
      });
      if (!user) throw new UnauthorizedException('User not found');
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async validateTelegramInitData(request: any, token: string): Promise<boolean> {
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
