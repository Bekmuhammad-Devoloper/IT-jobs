import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateTelegramWebApp(initDataRaw: string) {
    const initData = new URLSearchParams(initDataRaw);
    const hash = initData.get('hash');
    initData.delete('hash');

    const dataCheckString = Array.from(initData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const botToken = this.configService.get<string>('BOT_TOKEN')!;
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram initData');
    }

    const userData = JSON.parse(initData.get('user') || '{}');

    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(userData.id) },
    });

    if (!user) {
      const photoUrl = userData.photo_url || await this.fetchTelegramPhotoUrl(userData.id);
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(userData.id),
          username: userData.username || null,
          firstName: userData.first_name || null,
          lastName: userData.last_name || null,
          photoUrl: photoUrl || null,
        },
      });
      this.logger.log(`New user created: ${userData.id}`);
    } else {
      // Update photo and username on each login
      const updateData: any = {};
      if (!user.photoUrl || (userData.photo_url && userData.photo_url !== user.photoUrl)) {
        const photoUrl = userData.photo_url || await this.fetchTelegramPhotoUrl(user.telegramId);
        if (photoUrl) updateData.photoUrl = photoUrl;
      }
      if (userData.username && userData.username !== user.username) updateData.username = userData.username;
      if (userData.first_name && userData.first_name !== user.firstName) updateData.firstName = userData.first_name;
      if (userData.last_name !== undefined && userData.last_name !== user.lastName) updateData.lastName = userData.last_name || null;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    }

    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    return {
      token,
      user: this.serializeUser(user),
    };
  }

  async validateAdminLogin(telegramId: string, secretKey: string) {
    // Support username/password login
    const adminUsername = this.configService.get('ADMIN_USERNAME');
    const adminPassword = this.configService.get('ADMIN_PASSWORD');

    if (adminUsername && adminPassword && telegramId === adminUsername && secretKey === adminPassword) {
      // Username/password login — find or create admin user
      const superAdminIds = this.configService.get<string>('SUPER_ADMIN_IDS', '');
      const firstAdminId = superAdminIds.split(',')[0]?.trim();

      let user = firstAdminId
        ? await this.prisma.user.findUnique({ where: { telegramId: BigInt(firstAdminId) } })
        : null;

      if (!user) {
        user = await this.prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'SUPERADMIN'] } } });
      }

      if (!user) {
        // Create a default admin user
        user = await this.prisma.user.create({
          data: {
            telegramId: BigInt(firstAdminId || '999999999'),
            username: 'admin',
            firstName: 'Admin',
            role: 'SUPERADMIN',
          },
        });
      }

      const token = this.jwtService.sign({
        sub: user.id,
        telegramId: user.telegramId.toString(),
        role: user.role,
      });

      return { token, user: this.serializeUser(user) };
    }

    // Legacy telegramId + secretKey login
    const adminSecret = this.configService.get('ADMIN_SECRET_KEY');
    if (secretKey !== adminSecret) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      throw new UnauthorizedException('Not an admin');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    return { token, user: this.serializeUser(user) };
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      return user ? this.serializeUser(user) : null;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      rating: user.rating ? Number(user.rating) : 0,
    };
  }

  async fetchTelegramPhotoUrl(telegramId: string | bigint): Promise<string | null> {
    try {
      const botToken = this.configService.get<string>('BOT_TOKEN')!;
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramId}&limit=1`);
      const data = await res.json();
      const photos = data?.result?.photos;
      if (!photos || photos.length === 0) return null;
      const photo = photos[0];
      const fileId = photo[photo.length - 1].file_id;
      const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();
      const filePath = fileData?.result?.file_path;
      if (!filePath) return null;
      return `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    } catch (e) {
      this.logger.warn(`Failed to fetch TG photo for ${telegramId}: ${e.message}`);
      return null;
    }
  }
}
