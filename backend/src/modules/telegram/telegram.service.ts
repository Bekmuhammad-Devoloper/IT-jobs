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

  async sendToChannel(text: string, parseMode: 'HTML' | 'MarkdownV2' = 'HTML', options?: any) {
    if (!this.channelId) return null;
    try {
      const msg = await this.api.sendMessage(this.channelId, text, { parse_mode: parseMode, ...options });
      return msg;
    } catch (error) {
      this.logger.error(`Failed to send to channel: ${error.message}`);
      return null;
    }
  }

  async sendNotification(chatId: number | string, text: string) {
    try {
      await this.api.sendMessage(chatId, text, { parse_mode: 'HTML' });
    } catch (error) {
      this.logger.error(`Failed to send notification to ${chatId}: ${error.message}`);
    }
  }

  async editChannelMessage(messageId: number, text: string, options?: any) {
    if (!this.channelId) return null;
    try {
      return await this.api.editMessageText(this.channelId, messageId, text, { parse_mode: 'HTML', ...options });
    } catch (error) {
      this.logger.error(`Failed to edit channel message ${messageId}: ${error.message}`);
      return null;
    }
  }

  async sendPostToChannel(post: any) {
    const channelUsername = this.config.get('CHANNEL_USERNAME', '@Yuksalishdev_ITjobs');
    const webappUrl = this.config.get('WEBAPP_URL', 'https://it-jobs.bekmuhammad.uz');
    const detailLink = `${webappUrl}/posts/${post.id}`;
    const author = post.author;
    const authorName = [author?.firstName, author?.lastName].filter(Boolean).join(' ') || 'Noma\'lum';

    let text = '';

    switch (post.type) {
      case 'RESUME':
        text = this.formatResume(post, authorName, channelUsername, detailLink);
        break;
      case 'VACANCY':
        text = this.formatVacancy(post, authorName, channelUsername, detailLink);
        break;
      case 'MENTOR':
        text = this.formatMentor(post, authorName, channelUsername, detailLink);
        break;
      case 'INTERNSHIP':
        text = this.formatInternship(post, authorName, channelUsername, detailLink);
        break;
      case 'COURSE':
        text = this.formatCourse(post, authorName, channelUsername, detailLink);
        break;
      default:
        text = this.formatDefault(post, authorName, channelUsername, detailLink);
    }

    const msg = await this.sendToChannel(text);
    return msg; // returns message object with message_id
  }

  // ── RESUME ──
  private formatResume(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      `<b>Ish joyi kerak:</b>`,
      '',
    ];
    lines.push(`👨‍💼 <b>Xodim:</b> ${authorName}`);
    if (p.author?.age) lines.push(`🕑 <b>Yosh:</b> ${p.author.age}`);
    if (p.technologies?.length) lines.push(`📚 <b>Texnologiya:</b> ${p.technologies.join(', ')}`);
    if (p.contactTelegram) lines.push(`🇺🇿 <b>Telegram:</b> ${p.contactTelegram}`);
    if (p.contactPhone) lines.push(`📞 <b>Aloqa:</b> ${p.contactPhone}`);
    if (p.city || p.author?.city) lines.push(`🌐 <b>Hudud:</b> ${p.city || p.author?.city}`);
    if (p.salary) lines.push(`💰 <b>Narxi:</b> ${p.salary}`);
    if (p.author?.profession) lines.push(`👨🏻‍💻 <b>Kasbi:</b> ${p.author.profession}`);
    if (p.experience || p.author?.experience) lines.push(`📊 <b>Tajriba:</b> ${p.experience || p.author.experience}`);
    if (p.workType) lines.push(`🕰 <b>Ish turi:</b> ${p.workType}`);
    if (p.link) lines.push(`🕐 <b>Murojaat qilish vaqti:</b> ${p.link}`);
    if (p.description) {
      lines.push(`🔎 <b>Maqsad:</b> ${p.description}`);
    }
    lines.push('');
    lines.push(`#xodim ${this.buildHashtags(p)}`);
    lines.push('');
    lines.push(`👉 <a href="${link}">Batafsil ko'rish</a> | ${channel}`);
    return lines.join('\n');
  }

  // ── VACANCY ──
  private formatVacancy(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      `<b>Xodim kerak:</b>`,
      '',
    ];
    if (p.company) lines.push(`🏢 <b>Idora:</b> ${p.company}`);
    if (p.technologies?.length) lines.push(`📚 <b>Texnologiya:</b> ${p.technologies.join(', ')}`);
    if (p.contactTelegram) lines.push(`🇺🇿 <b>Telegram:</b> ${p.contactTelegram}`);
    if (p.contactPhone) lines.push(`📞 <b>Aloqa:</b> ${p.contactPhone}`);
    if (p.city) lines.push(`🌐 <b>Hudud:</b> ${p.city}`);
    const authorTg = p.author?.username ? `@${p.author.username}` : (p.contactTelegram || '');
    lines.push(`👷 <b>Mas'ul:</b> ${authorName}${authorTg ? ' ' + authorTg : ''}`);
    if (p.link) lines.push(`🕰 <b>Murojaat vaqti:</b> ${p.link}`);
    if (p.workType) lines.push(`🕐 <b>Ish formati:</b> ${p.workType}`);
    if (p.salary) lines.push(`💰 <b>Maosh:</b> ${p.salary}`);
    if (p.description) {
      lines.push(`‼️ <b>Qo'shimcha:</b> ${p.description.length > 500 ? p.description.substring(0, 500) + '...' : p.description}`);
    }
    lines.push('');
    lines.push(`#vakansiya ${this.buildHashtags(p)}`);
    lines.push('');
    lines.push(`👉 <a href="${link}">Batafsil ko'rish</a> | ${channel}`);
    return lines.join('\n');
  }

  // ── MENTOR ──
  private formatMentor(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      `👨‍🏫 <b>Mentor: ${authorName}</b>`,
    ];
    if (p.title && p.title !== authorName) lines.push(`📌 <b>${p.title}</b>`);
    if (p.author?.profession) lines.push(`� <b>Kasbi:</b> ${p.author.profession}`);
    if (p.experience || p.author?.experience) lines.push(`📊 <b>Tajriba:</b> ${p.experience || p.author.experience}`);
    if (p.technologies?.length) lines.push(`🛠 <b>Texnologiyalar:</b> ${p.technologies.join(', ')}`);
    if (p.city || p.author?.city) lines.push(`🌐 <b>Hudud:</b> ${p.city || p.author?.city}`);
    if (p.salary) lines.push(`💰 <b>Narxi:</b> ${p.salary}`);
    if (p.description) {
      lines.push('');
      lines.push(`📝 ${p.description.length > 500 ? p.description.substring(0, 500) + '...' : p.description}`);
    }
    lines.push('');
    if (p.contactTelegram) lines.push(`📩 <b>Aloqa:</b> ${p.contactTelegram}`);
    if (p.contactPhone) lines.push(`📞 ${p.contactPhone}`);
    lines.push('');
    lines.push(`#mentor ${this.buildHashtags(p)}`);
    lines.push('');
    lines.push(`👉 <a href="${link}">Batafsil ko'rish</a> | ${channel}`);
    return lines.join('\n');
  }

  // ── INTERNSHIP ──
  private formatInternship(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      `🎓 <b>Stajirovka: ${p.title}</b>`,
    ];
    if (p.company) lines.push(`🏢 <b>Kompaniya:</b> ${p.company}`);
    if (p.city) lines.push(`📍 <b>Hudud:</b> ${p.city}`);
    if (p.salary) lines.push(`💰 <b>Narxi:</b> ${p.salary}`);
    if (p.experience) lines.push(`📊 <b>Talab:</b> ${p.experience}`);
    if (p.workType) lines.push(`🕐 <b>Ish turi:</b> ${p.workType}`);
    if (p.technologies?.length) lines.push(`🛠 <b>Texnologiyalar:</b> ${p.technologies.join(', ')}`);
    if (p.description) {
      lines.push('');
      lines.push(p.description.length > 500 ? p.description.substring(0, 500) + '...' : p.description);
    }
    lines.push('');
    if (p.contactTelegram) lines.push(`📩 <b>Aloqa:</b> ${p.contactTelegram}`);
    if (p.contactPhone) lines.push(`📞 ${p.contactPhone}`);
    lines.push('');
    lines.push(`#stajirovka ${this.buildHashtags(p)}`);
    lines.push('');
    lines.push(`👉 <a href="${link}">Batafsil ko'rish</a> | ${channel}`);
    return lines.join('\n');
  }

  // ── COURSE ──
  private formatCourse(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      `📚 <b>Kurs: ${p.title}</b>`,
    ];
    if (p.company) lines.push(`🏫 <b>O'quv markaz:</b> ${p.company}`);
    if (p.city) lines.push(`� <b>Hudud:</b> ${p.city}`);
    if (p.salary) lines.push(`💰 <b>Narxi:</b> ${p.salary}`);
    if (p.workType) lines.push(`🕐 <b>Format:</b> ${p.workType}`);
    if (p.technologies?.length) lines.push(`🛠 <b>Texnologiyalar:</b> ${p.technologies.join(', ')}`);
    if (p.description) {
      lines.push('');
      lines.push(p.description.length > 500 ? p.description.substring(0, 500) + '...' : p.description);
    }
    lines.push('');
    if (p.contactTelegram) lines.push(`📩 <b>Aloqa:</b> ${p.contactTelegram}`);
    if (p.contactPhone) lines.push(`📞 ${p.contactPhone}`);
    lines.push('');
    lines.push(`#kurs ${this.buildHashtags(p)}`);
    lines.push('');
    lines.push(`👉 <a href="${link}">Batafsil ko'rish</a> | ${channel}`);
    return lines.join('\n');
  }

  // ── DEFAULT ──
  private formatDefault(p: any, authorName: string, channel: string, link: string): string {
    const lines: string[] = [
      `📌 <b>${p.title}</b>`,
      '',
    ];
    if (p.description) lines.push(p.description.length > 300 ? p.description.substring(0, 300) + '...' : p.description);
    lines.push('');
    lines.push(`👉 <a href="${link}">Batafsil ko'rish</a> | ${channel}`);
    return lines.join('\n');
  }

  private buildHashtags(p: any): string {
    const tags: string[] = [];
    if (p.technologies?.length) {
      p.technologies.slice(0, 5).forEach((t: string) => {
        const clean = t.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '');
        if (clean) tags.push(`#${clean}`);
      });
    }
    if (p.city) {
      const cleanCity = p.city.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '');
      if (cleanCity) tags.push(`#${cleanCity}`);
    }
    return tags.join(' ');
  }
}
