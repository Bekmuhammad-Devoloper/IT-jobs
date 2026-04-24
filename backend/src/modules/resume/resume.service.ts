import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EducationDto,
  ExperienceDto,
  GenerateResumeDto,
  ResumeTemplate,
} from './dto/generate-resume.dto';
import { TelegramService } from '../telegram/telegram.service';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const REQUEST_TIMEOUT_MS = 30_000;

export interface ResumeEntry {
  headerLeft: string;
  headerRight: string;
  subLeft: string;
  subRight: string;
  bullets: string[];
}

export interface GeneratedResume {
  template: ResumeTemplate;
  fullName: string;
  contact: string;
  education: ResumeEntry[];
  experience: ResumeEntry[];
  leadership: ResumeEntry[];
  skills: string;
  interests: string;
}

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly telegram: TelegramService,
  ) {}

  async generate(dto: GenerateResumeDto): Promise<GeneratedResume> {
    if (dto.paymentProof) {
      this.notifyAdmins(dto).catch((err) =>
        this.logger.warn(`Admin notify failed: ${err?.message}`),
      );
    }
    const polished = await this.polishWithAI(dto);
    return this.buildResume(dto, polished);
  }

  private async notifyAdmins(dto: GenerateResumeDto) {
    if (!dto.paymentProof) return;
    const webappUrl = this.config.get<string>('WEBAPP_URL', '');
    const fullUrl = dto.paymentProof.startsWith('http')
      ? dto.paymentProof
      : `${webappUrl.replace(/\/$/, '')}${dto.paymentProof}`;
    const caption =
      [
        '<b>💳 Yangi rezyume buyurtmasi</b>',
        dto.serviceTitle ? `🎯 Xizmat: ${this.esc(dto.serviceTitle)}` : '',
        dto.amount ? `💰 Summa: ${this.esc(dto.amount)} so'm` : '',
        '',
        `👤 Ism: ${this.esc(dto.fullName)}`,
        dto.targetRole ? `📌 Lavozim: ${this.esc(dto.targetRole)}` : '',
        dto.phone ? `📞 ${this.esc(dto.phone)}` : '',
        dto.email ? `📧 ${this.esc(dto.email)}` : '',
        '',
        `🖼 Chek rasm: ${this.esc(fullUrl)}`,
      ]
        .filter(Boolean)
        .join('\n');
    await this.telegram.sendPhotoToAdmins(fullUrl, caption);
  }

  private esc(s: string): string {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private getKeys(): string[] {
    const keys = [
      this.config.get<string>('GEMINI_API_KEY'),
      this.config.get<string>('GEMINI_API_KEY_2'),
    ].filter((k): k is string => !!k && k.trim().length > 0);
    if (keys.length === 0) {
      throw new InternalServerErrorException('Gemini API key sozlanmagan');
    }
    return keys;
  }

  private async polishWithAI(
    dto: GenerateResumeDto,
  ): Promise<PolishedAI> {
    const prompt = this.buildPrompt(dto);
    const keys = this.getKeys();
    let lastError: unknown;
    for (const key of keys) {
      try {
        const raw = await this.callGeminiOnce(prompt, key);
        return this.parseAIResponse(raw);
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        if (/\b(429|5\d\d)\b/.test(msg) || /abort/i.test(msg)) {
          this.logger.warn(`Gemini key fallback: ${msg}`);
          continue;
        }
        break;
      }
    }
    this.logger.error('Gemini failed, using raw user data', lastError as any);
    return { experience: [], education: [], leadership: [] };
  }

  private async callGeminiOnce(prompt: string, key: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`);
      }
      const data: any = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text || typeof text !== 'string') {
        throw new Error('Gemini empty response');
      }
      return text.trim();
    } finally {
      clearTimeout(timer);
    }
  }

  private parseAIResponse(raw: string): PolishedAI {
    try {
      const trimmed = raw.replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(trimmed);
      return {
        experience: this.coerceBulletArray(parsed.experience),
        education: this.coerceBulletArray(parsed.education),
        leadership: this.coerceBulletArray(parsed.leadership),
      };
    } catch {
      return { experience: [], education: [], leadership: [] };
    }
  }

  private coerceBulletArray(x: any): string[][] {
    if (!Array.isArray(x)) return [];
    return x.map((item) => {
      if (Array.isArray(item)) {
        return item.filter((s) => typeof s === 'string' && s.trim().length);
      }
      if (item && Array.isArray(item.bullets)) {
        return item.bullets.filter(
          (s: any) => typeof s === 'string' && s.trim().length,
        );
      }
      return [];
    });
  }

  private buildPrompt(dto: GenerateResumeDto): string {
    const edu =
      dto.education?.map((e) => ({
        university: e.university,
        degree: e.degree,
        coursework: e.coursework || '',
      })) || [];
    const exp =
      dto.experience?.map((e) => ({
        company: e.company,
        position: e.position,
        description: e.description || '',
      })) || [];
    const lead =
      dto.leadership?.map((e) => ({
        company: e.company,
        position: e.position,
        description: e.description || '',
      })) || [];

    return [
      "Siz O'zbek tilida rezyume matnlarini sayqallaydigan yordamchisiz.",
      'Har bir tajriba uchun 2–5 ta professional bullet point yozing. Har bullet:',
      "• Kuchli harakat fe'li bilan boshlansin (Yaratdi, Rivojlantirdi, Yetakchilik qildi, Optimallashtirdi, Amalga oshirdi, Ishtirok etdi, Tahlil qildi).",
      '• Qisqa bo\'lsin (15–25 so\'z). Grammatik jihatdan toza.',
      '• Iloji bo\'lsa raqamli natija qo\'shing (masalan: "30% tezlashtirdi", "5 ta loyiha").',
      '• Foydalanuvchi kiritmagan faktlarni o\'ylab topmang.',
      `Maqsadli lavozim: ${dto.targetRole || '—'}`,
      '',
      'FAQAT shu JSON strukturada javob qaytaring, hech qanday qo\'shimcha matn emas:',
      '{',
      '  "experience": [["bullet1","bullet2","bullet3"], ...],',
      '  "education": [["bullet1","bullet2"], ...],',
      '  "leadership": [["bullet1","bullet2"], ...]',
      '}',
      'Tartib kiritilgan tartib bilan mos kelsin. Agar tajriba bo\'sh bo\'lsa, bo\'sh massiv [] qaytar.',
      '',
      '--- KIRITILGAN MA\'LUMOT ---',
      JSON.stringify({ experience: exp, education: edu, leadership: lead }, null, 2),
      '--- END ---',
    ].join('\n');
  }

  private buildResume(dto: GenerateResumeDto, ai: PolishedAI): GeneratedResume {
    const contact = [dto.city, dto.linkedin, dto.phone, dto.email]
      .map((s) => (s || '').trim())
      .filter(Boolean)
      .join(' | ');

    const eduFallback = (e: EducationDto): string[] => {
      const items: string[] = [];
      if (e.coursework) {
        e.coursework
          .split(/\r?\n|;/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => items.push(s));
      }
      return items;
    };

    const expFallback = (e: ExperienceDto): string[] => {
      if (!e.description) return [];
      return e.description
        .split(/\r?\n/)
        .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
        .filter(Boolean);
    };

    const buildEntries = (
      rows: Array<EducationDto | ExperienceDto>,
      kind: 'edu' | 'exp',
      aiRows: string[][],
    ): ResumeEntry[] =>
      rows.map((row, i) => {
        const aiBullets = aiRows[i] || [];
        if (kind === 'edu') {
          const e = row as EducationDto;
          const bullets =
            aiBullets.length > 0 ? aiBullets : eduFallback(e);
          return {
            headerLeft: e.university,
            headerRight: e.city || '',
            subLeft: e.degree,
            subRight: e.graduationYear || '',
            bullets,
          };
        }
        const e = row as ExperienceDto;
        const bullets =
          aiBullets.length > 0 ? aiBullets : expFallback(e);
        return {
          headerLeft: e.company,
          headerRight: e.city || '',
          subLeft: e.position,
          subRight: e.period || '',
          bullets,
        };
      });

    const education = buildEntries(dto.education || [], 'edu', ai.education);
    const experience = buildEntries(dto.experience || [], 'exp', ai.experience);
    const leadership = buildEntries(dto.leadership || [], 'exp', ai.leadership);

    const skillsParts: string[] = [];
    if (dto.skills?.length) skillsParts.push(dto.skills.join(', '));
    if (dto.languages?.length) {
      skillsParts.push(`Tillar: ${dto.languages.join(', ')}`);
    }

    return {
      template: dto.template,
      fullName: dto.fullName,
      contact,
      education,
      experience,
      leadership,
      skills: skillsParts.join(' · '),
      interests: dto.interests || '',
    };
  }
}

interface PolishedAI {
  experience: string[][];
  education: string[][];
  leadership: string[][];
}
