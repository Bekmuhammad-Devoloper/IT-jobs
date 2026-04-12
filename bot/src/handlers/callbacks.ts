import { Context } from 'grammy';
import { checkSubscription } from '../middlewares/subscription';
import { mainKeyboard } from '../keyboards';
import { config } from '../config';

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
      const res = await fetch(`${config.apiUrl}/admin/moderation/${postId}/approve`, {
        method: 'PUT',
      });
      if (res.ok) {
        await ctx.answerCallbackQuery({ text: '✅ E\'lon tasdiqlandi!' });
        await ctx.editMessageText(ctx.callbackQuery?.message?.text + '\n\n✅ TASDIQLANDI', {
          parse_mode: 'HTML',
        });
      }
    } catch {
      await ctx.answerCallbackQuery({ text: '❌ Xatolik yuz berdi' });
    }
    return;
  }

  // Admin: reject post
  if (data.startsWith('reject_')) {
    const postId = data.replace('reject_', '');
    try {
      const res = await fetch(`${config.apiUrl}/admin/moderation/${postId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin tomonidan rad etildi' }),
      });
      if (res.ok) {
        await ctx.answerCallbackQuery({ text: '❌ E\'lon rad etildi!' });
        await ctx.editMessageText(ctx.callbackQuery?.message?.text + '\n\n❌ RAD ETILDI', {
          parse_mode: 'HTML',
        });
      }
    } catch {
      await ctx.answerCallbackQuery({ text: '❌ Xatolik yuz berdi' });
    }
    return;
  }

  await ctx.answerCallbackQuery();
}
