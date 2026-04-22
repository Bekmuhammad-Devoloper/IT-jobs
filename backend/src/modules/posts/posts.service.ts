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
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class PostsService {
  private cooldownDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {
    this.cooldownDays = this.config.get<number>('POST_COOLDOWN_DAYS', 15);
  }

  async create(userId: number, dto: CreatePostDto) {
    const cooldownKey = `cooldown:${userId}:${dto.type}`;

    if (dto.type === 'RESUME') {
      const ttl = await this.redis.getClient().ttl(cooldownKey);
      if (ttl > 0) {
        const hours = Math.ceil(ttl / 3600);
        const msg =
          hours >= 24
            ? `Siz ${dto.type} turi uchun yana ${Math.ceil(hours / 24)} kun kutishingiz kerak`
            : `Siz ${dto.type} turi uchun yana ${hours} soat kutishingiz kerak`;
        throw new BadRequestException(msg);
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

    if (dto.type === 'RESUME') {
      await this.redis.set(cooldownKey, '1', this.cooldownDays * 24 * 60 * 60);
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
    // Hide closed posts from public listings
    if (!status) {
      where.isClosed = false;
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
      include: { author: true, category: true, _count: { select: { views: true, applications: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return this.serialize(post);
  }

  async addView(postId: number, userId?: number, fingerprint?: string) {
    const identifier = userId ? `user:${userId}` : `fp:${fingerprint}`;
    const viewKey = `view:${postId}:${identifier}`;

    const acquired = await this.redis.setNx(viewKey, '1', 86400);
    if (!acquired) return;

    try {
      await this.prisma.postView.create({
        data: { postId, userId, fingerprint },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
      });
    } catch (e) {
      await this.redis.del(viewKey);
      throw e;
    }
  }

  async getUserPosts(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        include: { category: true, _count: { select: { views: true, applications: true } } },
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

  async applyToPost(postId: number, userId: number, data: { message?: string; resumeUrl?: string; portfolio?: string }) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.status !== PostStatus.APPROVED) throw new BadRequestException("Bu e'lon hali tasdiqlanmagan");
    if (post.isClosed) throw new BadRequestException('Bu vakansiya yopilgan');
    if (post.authorId === userId) throw new BadRequestException("O'z e'loningizga murojaat qila olmaysiz");

    let app;
    try {
      app = await this.prisma.application.create({
        data: {
          postId,
          userId,
          message: data.message,
          resumeUrl: data.resumeUrl,
          portfolio: data.portfolio,
        },
        include: { user: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException('Siz allaqachon murojaat qilgansiz');
      }
      throw e;
    }

    return {
      ...app,
      user: {
        ...app.user,
        telegramId: app.user.telegramId?.toString(),
        rating: app.user.rating ? Number(app.user.rating) : 0,
      },
    };
  }

  async getApplications(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');

    const applications = await this.prisma.application.findMany({
      where: { postId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      ...a,
      user: {
        ...a.user,
        telegramId: a.user.telegramId?.toString(),
        rating: a.user.rating ? Number(a.user.rating) : 0,
      },
    }));
  }

  async closeVacancy(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');
    if (post.isClosed) throw new BadRequestException('Allaqachon yopilgan');

    await this.prisma.post.update({
      where: { id: postId },
      data: { isClosed: true },
    });

    // Edit TG channel message if exists
    const extra = post.extra as any;
    if (extra?.channelLink) {
      // Extract message_id from channel link
      const parts = extra.channelLink.split('/');
      const messageId = parseInt(parts[parts.length - 1], 10);
      if (Number.isFinite(messageId) && messageId > 0) {
        const channelUsername = this.config.get('CHANNEL_USERNAME', '@Yuksalishdev_ITjobs');
        const webappUrl = this.config.get('WEBAPP_URL', 'https://it-jobs.bekmuhammad.uz');
        const detailLink = `${webappUrl}/posts/${post.id}`;
        const authorName = [post.author?.firstName, post.author?.lastName].filter(Boolean).join(' ') || "Noma'lum";
        const authorTg = post.author?.username ? `@${post.author.username}` : '';

        const lines: string[] = [
          `<b>Xodim kerak:</b>`,
          `<blockquote>✅ Xodim topildi</blockquote>`,
          '',
        ];
        if (post.company) lines.push(`🏢 <b>Idora:</b> ${post.company}`);
        if (post.technologies?.length) lines.push(`📚 <b>Texnologiya:</b> ${(post.technologies as string[]).join(', ')}`);
        lines.push(`👷 <b>Admin:</b> ${authorName}${authorTg ? ' ' + authorTg : ''}`);
        if (post.salary) lines.push(`💰 <b>Maosh:</b> ${post.salary}`);
        lines.push('');
        lines.push(`#vakansiya #xodim_topildi`);
        lines.push('');
        lines.push(`👉 <a href="${detailLink}">Batafsil ko'rish</a> | ${channelUsername}`);

        await this.telegram.editChannelMessage(messageId, lines.join('\n'));
      }
    }

    return { message: 'Vakansiya yopildi' };
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
      applicationCount: post._count?.applications ?? 0,
    };
  }
}
