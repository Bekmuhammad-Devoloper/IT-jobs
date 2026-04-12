import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RatingService } from '../rating/rating.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly ratingService: RatingService,
  ) {}

  // Recalculate all user ratings every day at 3:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleRatingRecalculation() {
    this.logger.log('Starting daily rating recalculation...');
    const result = await this.ratingService.recalculateAllRatings();
    this.logger.log(`Rating recalculation complete: ${result.updated}/${result.total}`);
  }

  // Clean expired posts every day at 2:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredPosts() {
    this.logger.log('Checking for expired posts...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.post.updateMany({
      where: {
        status: 'APPROVED',
        createdAt: { lt: thirtyDaysAgo },
      },
      data: { status: 'EXPIRED' },
    });

    this.logger.log(`Expired ${result.count} posts`);
  }

  // Clear stale Redis cache every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCacheCleanup() {
    this.logger.log('Clearing stats cache...');
    await this.redis.del('stats:public');
    this.logger.log('Stats cache cleared');
  }
}
