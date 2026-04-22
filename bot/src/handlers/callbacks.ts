import { Context } from 'grammy';
import { checkSubscription } from '../middlewares/subscription';
import { mainKeyboard } from '../keyboards';
import { config } from '../config';

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function handleCallbackQuery(ctx: Context) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  // Check subscription callback
  if (data === 'check_subscription') {
    const isSubscribed = await checkSubscription(ctx);
    if (isSubscribed) {
      await ctx.answerCallbackQuery({ text: '✅ Obuna tasdiqlandi!' });
      await ctx.reply(
        `🎉 Ajoyib! Endi botdan to'liq foydalanishingiz mumkin.\n\n📱 Web App ni oching:`,
        {
          parse_mode: 'HTML',
          reply_markup: mainKeyboard(),
        },
      );
    } else {
      await ctx.answerCallbackQuery({
        text: '❌ Siz hali kanalga obuna bo\'lmagansiz!',
        show_alert: true,
      });
    }
    return;
  }

  // Admin: approve post
  if (data.startsWith('approve_')) {
    const postId = data.replace('approve_', '');
    try {
      const res = await fetchWithTimeout(`${config.apiUrl}/admin/moderation/${postId}/approve`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[bot] approve failed: ${res.status} ${errText}`);
        await ctx.answerCallbackQuery({ text: `❌ Xatolik (${res.status})`, show_alert: true });
        return;
      }
      await ctx.answerCallbackQuery({ text: '✅ E\'lon tasdiqlandi!' });
      await ctx.editMessageText((ctx.callbackQuery?.message?.text || '') + '\n\n✅ TASDIQLANDI', {
        parse_mode: 'HTML',
      });
    } catch (e: any) {
      console.error('[bot] approve error:', e?.message);
      await ctx.answerCallbackQuery({ text: '❌ Xatolik yuz berdi', show_alert: true });
    }
    return;
  }

  // Admin: reject post
  if (data.startsWith('reject_')) {
    const postId = data.replace('reject_', '');
    try {
      const res = await fetchWithTimeout(`${config.apiUrl}/admin/moderation/${postId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin tomonidan rad etildi' }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error(`[bot] reject failed: ${res.status} ${errText}`);
        await ctx.answerCallbackQuery({ text: `❌ Xatolik (${res.status})`, show_alert: true });
        return;
      }
      await ctx.answerCallbackQuery({ text: '❌ E\'lon rad etildi!' });
      await ctx.editMessageText((ctx.callbackQuery?.message?.text || '') + '\n\n❌ RAD ETILDI', {
        parse_mode: 'HTML',
      });
    } catch (e: any) {
      console.error('[bot] reject error:', e?.message);
      await ctx.answerCallbackQuery({ text: '❌ Xatolik yuz berdi', show_alert: true });
    }
    return;
  }

  await ctx.answerCallbackQuery();
}
