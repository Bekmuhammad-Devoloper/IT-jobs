import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TelegramService } from '../telegram/telegram.service';
import { PostStatus, UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly telegram: TelegramService,
    private readonly config: ConfigService,
  ) {}

  // ── Users ──────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, q?: string, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(this.serializeUser),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { posts: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.serializeUser(user);
  }

  async blockUser(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: true },
    });
    return this.serializeUser(user);
  }

  async unblockUser(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: false },
    });
    return this.serializeUser(user);
  }

  async setUserRole(id: number, role: UserRole) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    return this.serializeUser(user);
  }

  // ── Posts ──────────────────────────────────────────────

  async getPosts(page = 1, limit = 20, status?: PostStatus, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: { author: true, category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map(this.serializePost),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async deletePost(id: number) {
    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted' };
  }

  async updatePostRating(id: number, rating: number) {
    const post = await this.prisma.post.update({
      where: { id },
      data: { rating },
      include: { author: true },
    });
    return this.serializePost(post);
  }

  async updatePostOrder(id: number, pinnedOrder: number | null) {
    const post = await this.prisma.post.update({
      where: { id },
      data: { pinnedOrder },
      include: { author: true },
    });
    return this.serializePost(post);
  }

  // ── Moderation ──────────────────────────────────────────

  async getPendingPosts(page = 1, limit = 20) {
    return this.getPosts(page, limit, PostStatus.PENDING);
  }

  async approvePost(id: number) {
    const { count } = await this.prisma.post.updateMany({
      where: { id, status: PostStatus.PENDING },
      data: { status: PostStatus.APPROVED },
    });
    if (count === 0) {
      throw new BadRequestException("E'lon topilmadi yoki allaqachon qayta ko'rilgan");
    }

    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
    if (!post) throw new NotFoundException("E'lon topilmadi");

    try {
      const msg = await this.telegram.sendPostToChannel(post);
      if (msg?.message_id) {
        const channelUsername = this.config.get('CHANNEL_USERNAME', 'Yuksalishdev_ITjobs');
        const channelLink = `https://t.me/${channelUsername.replace('@', '')}/${msg.message_id}`;
        await this.prisma.post.update({
          where: { id },
          data: { extra: { channelLink } },
        });
        (post as any).extra = { channelLink };
      }
    } catch (e) {
      this.logger.error(`Channel post failed for post ${id}`, e instanceof Error ? e.stack : e);
    }

    return this.serializePost(post);
  }

  async rejectPost(id: number, reason?: string) {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.REJECTED,
        rejectReason: reason,
      },
      include: { author: true },
    });
    return this.serializePost(post);
  }

  // ── Settings ──────────────────────────────────────────

  async getSettings() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ── Categories ──────────────────────────────────────────

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { order: 'asc' } });
  }

  async createCategory(data: { name: string; slug: string; type: string; order?: number }) {
    return this.prisma.category.create({ data });
  }

  async updateCategory(id: number, data: { name?: string; slug?: string; isActive?: boolean; order?: number }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: number) {
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted' };
  }

  // ── Technologies ──────────────────────────────────────────

  async getTechnologies() {
    return this.prisma.technology.findMany({ orderBy: { category: 'asc' } });
  }

  async createTechnology(data: { name: string; category: string }) {
    return this.prisma.technology.create({ data });
  }

  async deleteTechnology(id: number) {
    await this.prisma.technology.delete({ where: { id } });
    return { message: 'Technology deleted' };
  }

  // ── Services ──────────────────────────────────────────

  async getServices() {
    return this.prisma.service.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
  }

  async createService(data: { title: string; description?: string; price?: string; icon?: string; order?: number; parentId?: number; formFields?: any }) {
    return this.prisma.service.create({ data });
  }

  async updateService(id: number, data: { title?: string; description?: string; price?: string; icon?: string; order?: number; isActive?: boolean; parentId?: number; formFields?: any }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async deleteService(id: number) {
    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service deleted' };
  }

  // ── Serializers ──────────────────────────────────────────

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId?.toString(),
      rating: user.rating ? Number(user.rating) : 0,
    };
  }

  private serializePost(post: any) {
    return {
      ...post,
      author: post.author
        ? {
            ...post.author,
            telegramId: post.author.telegramId?.toString(),
            rating: post.author.rating ? Number(post.author.rating) : 0,
          }
        : undefined,
    };
  }
}
