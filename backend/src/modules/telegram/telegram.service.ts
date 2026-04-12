import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api } from 'grammy';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private api: Api;
  private channelId: string;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('BOT_TOKEN');
    this.channelId = this.config.get<string>('CHANNEL_ID', '');
    this.api = new Api(token!);
  }

  async checkSubscription(telegramId: number | bigint): Promise<boolean> {
    if (!this.channelId) return true;
    try {
      const member = await this.api.getChatMember(this.channelId, Number(telegramId));
      return ['member', 'administrator', 'creator'].includes(member.status);
    } catch (error) {
      this.logger.warn(`Subscription check failed for ${telegramId}: ${error.message}`);
      return false;
    }
  }

  async sendToChannel(text: string, parseMode: 'HTML' | 'MarkdownV2' = 'HTML') {
    if (!this.channelId) return;
    try {
      await this.api.sendMessage(this.channelId, text, { parse_mode: parseMode });
    } catch (error) {
      this.logger.error(`Failed to send to channel: ${error.message}`);
    }
  }

  async sendNotification(chatId: number | string, text: string) {
    try {
      await this.api.sendMessage(chatId, text, { parse_mode: 'HTML' });
    } catch (error) {
      this.logger.error(`Failed to send notification to ${chatId}: ${error.message}`);
    }
  }

  async sendPostToChannel(post: any) {
    const typeLabels: Record<string, string> = {
      VACANCY: '💼 Vakansiya',
      RESUME: '📄 Rezyume',
      COURSE: '📚 Kurs',
      MENTOR: '👨‍🏫 Mentor',
      INTERNSHIP: '🎓 Stajirovka',
    };

    const lines: string[] = [
      `<b>${typeLabels[post.type] || post.type}</b>`,
      '',
      `📌 <b>${post.title}</b>`,
    ];

    if (post.company) lines.push(`🏢 ${post.company}`);
    if (post.city) lines.push(`📍 ${post.city}`);
    if (post.salary) lines.push(`💰 ${post.salary}`);
    if (post.technologies?.length) {
      lines.push(`🛠 ${post.technologies.join(', ')}`);
    }
    if (post.description) {
      const short = post.description.length > 200
        ? post.description.substring(0, 200) + '...'
        : post.description;
      lines.push('', short);
    }

    lines.push('', `👉 <a href="${this.config.get('WEBAPP_URL', 'https://itjobs.uz')}/posts/${post.id}">Batafsil ko'rish</a>`);

    await this.sendToChannel(lines.join('\n'));
  }
}
