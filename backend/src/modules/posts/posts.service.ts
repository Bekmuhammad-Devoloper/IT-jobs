import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostFilterDto } from './dto/post-filter.dto';
import { PostStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsService {
  private cooldownDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.cooldownDays = this.config.get<number>('POST_COOLDOWN_DAYS', 15);
  }

  async create(userId: number, dto: CreatePostDto) {
    // Check cooldown — only for RESUME type
    if (dto.type === 'RESUME') {
      const cooldownKey = `cooldown:${userId}:${dto.type}`;
      const hasCooldown = await this.redis.exists(cooldownKey);
      if (hasCooldown) {
        const ttl = await this.redis.getClient().ttl(cooldownKey);
        const days = Math.ceil(ttl / 86400);
        throw new BadRequestException(
          `Siz ${dto.type} turi uchun ${days} kun kutishingiz kerak`,
        );
      }
    }

    const post = await this.prisma.post.create({
      data: {
        ...dto,
        authorId: userId,
        status: PostStatus.PENDING,
      },
      include: { author: true, category: true },
    });

    // Set cooldown — only for RESUME type
    if (dto.type === 'RESUME') {
      await this.redis.set(
        `cooldown:${userId}:${dto.type}`,
        '1',
        this.cooldownDays * 24 * 60 * 60,
      );
    }

    return this.serialize(post);
  }

  async findAll(filters: PostFilterDto) {
    const { type, status, q, city, technology, categoryId, page, limit, sort, order } = filters;
    const skip = ((page || 1) - 1) * (limit || 20);

    const where: any = {};

    if (type) where.type = type;
    if (status) {
      where.status = status;
    } else {
      where.status = PostStatus.APPROVED;
    }
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    if (technology) where.technologies = { has: technology };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: { author: true, category: true, _count: { select: { views: true } } },
        orderBy: { [sort || 'createdAt']: order || 'desc' },
        skip,
        take: limit || 20,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map(this.serialize),
      meta: {
        total,
        page: page || 1,
        limit: limit || 20,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    };
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true, category: true, _count: { select: { views: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return this.serialize(post);
  }

  async addView(postId: number, userId?: number, fingerprint?: string) {
    const identifier = userId ? `user:${userId}` : `fp:${fingerprint}`;
    const viewKey = `view:${postId}:${identifier}`;

    const alreadyViewed = await this.redis.exists(viewKey);
    if (alreadyViewed) return;

    await this.prisma.postView.create({
      data: { postId, userId, fingerprint },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    // Cache view for 24 hours to prevent duplicate counts
    await this.redis.set(viewKey, '1', 86400);
  }

  async getUserPosts(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        include: { category: true, _count: { select: { views: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { authorId: userId } }),
    ]);

    return {
      data: posts.map(this.serialize),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async deletePost(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted' };
  }

  private serialize(post: any) {
    return {
      ...post,
      author: post.author
        ? {
            ...post.author,
            telegramId: post.author.telegramId?.toString(),
            rating: post.author.rating ? Number(post.author.rating) : 0,
          }
        : undefined,
      viewCount: post._count?.views ?? post.viewCount ?? 0,
    };
  }
}
