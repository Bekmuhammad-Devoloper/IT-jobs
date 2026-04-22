import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  // Weights for rating calculation
  private readonly WEIGHTS = {
    profileCompleted: 10,
    hasBio: 5,
    hasPortfolio: 5,
    hasGithub: 5,
    techCount: 2,       // per tech, max 20
    postCount: 3,       // per approved post, max 30
    viewCount: 0.01,    // per view on posts, max 10
    accountAge: 0.5,    // per month, max 6
  };

  constructor(private readonly prisma: PrismaService) {}

  async calculateUserRating(userId: number): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: { where: { status: 'APPROVED' } },
      },
    });

    if (!user) return 0;

    let score = 0;

    // Profile completeness
    if (user.profileCompleted) score += this.WEIGHTS.profileCompleted;
    if (user.bio) score += this.WEIGHTS.hasBio;
    if (user.portfolio) score += this.WEIGHTS.hasPortfolio;
    if (user.github) score += this.WEIGHTS.hasGithub;

    // Technologies
    const techScore = Math.min((user.technologies?.length || 0) * this.WEIGHTS.techCount, 20);
    score += techScore;

    // Posts
    const postScore = Math.min(user.posts.length * this.WEIGHTS.postCount, 30);
    score += postScore;

    // Views on posts
    const totalViews = user.posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const viewScore = Math.min(totalViews * this.WEIGHTS.viewCount, 10);
    score += viewScore;

    // Account age (months)
    const months = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000),
    );
    const ageScore = Math.min(months * this.WEIGHTS.accountAge, 6);
    score += ageScore;

    // Normalize to 0-100
    const rating = Math.min(Math.round(score), 100);

    // Update user rating
    await this.prisma.user.update({
      where: { id: userId },
      data: { rating: new Decimal(rating) },
    });

    return rating;
  }

  async recalculateAllRatings() {
    const users = await this.prisma.user.findMany({
      include: { posts: { where: { status: 'APPROVED' }, select: { viewCount: true } } },
    });
    let updated = 0;

    for (const user of users) {
      try {
        let score = 0;
        if (user.profileCompleted) score += this.WEIGHTS.profileCompleted;
        if (user.bio) score += this.WEIGHTS.hasBio;
        if (user.portfolio) score += this.WEIGHTS.hasPortfolio;
        if (user.github) score += this.WEIGHTS.hasGithub;
        score += Math.min((user.technologies?.length || 0) * this.WEIGHTS.techCount, 20);
        score += Math.min(user.posts.length * this.WEIGHTS.postCount, 30);
        const totalViews = user.posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
        score += Math.min(totalViews * this.WEIGHTS.viewCount, 10);
        const months = Math.floor(
          (Date.now() - user.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000),
        );
        score += Math.min(months * this.WEIGHTS.accountAge, 6);
        const rating = Math.min(Math.round(score), 100);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { rating: new Decimal(rating) },
        });
        updated++;
      } catch (err: any) {
        this.logger.error(`Failed to calc rating for user ${user.id}: ${err.message}`);
      }
    }

    this.logger.log(`Recalculated ratings for ${updated}/${users.length} users`);
    return { updated, total: users.length };
  }
}
