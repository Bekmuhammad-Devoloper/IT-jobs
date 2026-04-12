import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.serialize(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        profileCompleted: this.checkProfileCompleted(dto),
        updatedAt: new Date(),
      },
    });
    return this.serialize(user);
  }

  async getResumes(query: { top?: number; recent?: number; q?: string; profession?: string }) {
    const { top = 10, recent = 10, q, profession } = query;

    const where: any = {
      profileCompleted: true,
      isBlocked: false,
    };

    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { profession: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (profession) {
      where.profession = { contains: profession, mode: 'insensitive' };
    }

    const topResumes = await this.prisma.user.findMany({
      where,
      orderBy: { rating: 'desc' },
      take: top,
    });

    const recentResumes = await this.prisma.user.findMany({
      where: { profileCompleted: true, isBlocked: false },
      orderBy: { updatedAt: 'desc' },
      take: recent,
    });

    return {
      top: topResumes.map(this.serialize),
      recent: recentResumes.map(this.serialize),
    };
  }

  async getResumeById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !user.profileCompleted) throw new NotFoundException('Resume not found');
    return this.serialize(user);
  }

  private checkProfileCompleted(dto: UpdateProfileDto): boolean {
    return !!(
      dto.firstName &&
      dto.lastName &&
      dto.city &&
      dto.profession &&
      dto.experience &&
      dto.level &&
      dto.technologies?.length
    );
  }

  private serialize(user: any) {
    return {
      ...user,
      telegramId: user.telegramId?.toString(),
      rating: user.rating ? Number(user.rating) : 0,
    };
  }
}
