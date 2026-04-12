import { Context } from 'grammy';
import { config } from '../config';
import { mainKeyboard, webAppKeyboard } from '../keyboards';

export async function handleStart(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  // User passed subscription guard — show welcome
  await ctx.reply(
    `💼 <b>IT Jobs UZ</b> ga xush kelibsiz, ${user.first_name}!\n\n` +
    `� Vakansiyalar, rezyumelar, kurslar, mentorlar va stajirovkalar — hammasi bir joyda!\n\n` +
    `� Web App orqali qulay interfeys bilan foydalaning yoki quyidagi tugmalardan birini tanlang:`,
    {
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(),
    },
  );
}

export async function handleHelp(ctx: Context) {
  await ctx.reply(
    `💡 <b>Yordam — IT Jobs UZ</b>\n\n` +
    `O'zbekiston IT bozorining yagona platformasi:\n\n` +
    `▫️ <b>Vakansiya qo'yish</b> — kompaniyalar uchun\n` +
    `▫️ <b>Rezyume qo'yish</b> — ish izlovchilar uchun\n` +
    `▫️ <b>Kurs e'lon qilish</b> — o'qituvchilar uchun\n` +
    `▫️ <b>Mentor bo'lish</b> — tajribali dasturchilar uchun\n` +
    `▫️ <b>Stajirovka</b> — yangi boshlovchilar uchun\n\n` +
    `� «Web App ochish» tugmasini bosib, barcha imkoniyatlardan foydalaning!`,
    { parse_mode: 'HTML' },
  );
}

export async function handleStats(ctx: Context) {
  try {
    const response = await fetch(`${config.apiUrl}/statistics`);
    const stats: any = await response.json();
    const d = stats.data || stats;

    await ctx.reply(
      `� <b>Statistika</b>\n\n` +
      `� Foydalanuvchilar: <b>${d.totalUsers || 0}</b>\n` +
      `� Jami e'lonlar: <b>${d.totalPosts || 0}</b>\n\n` +
      `┣ 💼 Vakansiyalar: <b>${d.byType?.vacancies || 0}</b>\n` +
      `┣ � Rezyumelar: <b>${d.byType?.resumes || 0}</b>\n` +
      `┣ 🎓 Kurslar: <b>${d.byType?.courses || 0}</b>\n` +
      `┣ 🧑‍� Mentorlar: <b>${d.byType?.mentors || 0}</b>\n` +
      `┗ 🚀 Stajirovkalar: <b>${d.byType?.internships || 0}</b>`,
      { parse_mode: 'HTML' },
    );
  } catch {
    await ctx.reply('⚠️ Statistikani olishda xatolik. Keyinroq urinib ko\'ring.');
  }
}

export async function handleProfile(ctx: Context) {
  const user = ctx.from;
  if (!user) return;

  await ctx.reply(
    `👤 <b>Sizning profilingiz</b>\n\n` +
    `🔹 ID: <code>${user.id}</code>\n` +
    `� Ism: ${user.first_name} ${user.last_name || ''}\n` +
    `� Username: ${user.username ? '@' + user.username : 'belgilanmagan'}\n\n` +
    `� To'liq profil va sozlamalar uchun Web App ni oching:`,
    {
      parse_mode: 'HTML',
      reply_markup: webAppKeyboard(),
    },
  );
}
