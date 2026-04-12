import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PostType, PostStatus } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPublicStats() {
    const cacheKey = 'stats:public';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [totalUsers, totalPosts, vacancies, resumes, courses, mentors, internships] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.post.count({ where: { status: PostStatus.APPROVED } }),
        this.prisma.post.count({ where: { type: PostType.VACANCY, status: PostStatus.APPROVED } }),
        this.prisma.post.count({ where: { type: PostType.RESUME, status: PostStatus.APPROVED } }),
        this.prisma.post.count({ where: { type: PostType.COURSE, status: PostStatus.APPROVED } }),
        this.prisma.post.count({ where: { type: PostType.MENTOR, status: PostStatus.APPROVED } }),
        this.prisma.post.count({ where: { type: PostType.INTERNSHIP, status: PostStatus.APPROVED } }),
      ]);

    const stats = {
      totalUsers,
      totalPosts,
      byType: { vacancies, resumes, courses, mentors, internships },
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), 300); // 5 min cache
    return stats;
  }

  async getAdminStats() {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalViews,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isBlocked: false } }),
      this.prisma.user.count({ where: { isBlocked: true } }),
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: PostStatus.PENDING } }),
      this.prisma.post.count({ where: { status: PostStatus.APPROVED } }),
      this.prisma.post.count({ where: { status: PostStatus.REJECTED } }),
      this.prisma.postView.count(),
    ]);

    // Posts by type
    const postsByType = await Promise.all(
      Object.values(PostType).map(async (type) => ({
        type,
        total: await this.prisma.post.count({ where: { type } }),
        approved: await this.prisma.post.count({ where: { type, status: PostStatus.APPROVED } }),
        pending: await this.prisma.post.count({ where: { type, status: PostStatus.PENDING } }),
      })),
    );

    // Daily stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyPosts = await this.prisma.post.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    });

    const dailyUsers = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    });

    return {
      users: { total: totalUsers, active: activeUsers, blocked: blockedUsers },
      posts: {
        total: totalPosts,
        pending: pendingPosts,
        approved: approvedPosts,
        rejected: rejectedPosts,
      },
      totalViews,
      postsByType,
      charts: { dailyPosts, dailyUsers },
    };
  }

  async getTopPosts(limit = 10) {
    return this.prisma.post.findMany({
      where: { status: PostStatus.APPROVED },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: { author: true, category: true },
    });
  }
}
