import { Context, NextFunction } from 'grammy';
import { config } from '../config';
import { subscribeKeyboard } from '../keyboards';

export async function checkSubscription(ctx: Context): Promise<boolean> {
  if (!config.channelId) return true;

  try {
    const userId = ctx.from?.id;
    if (!userId) return false;

    const member = await ctx.api.getChatMember(config.channelId, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch {
    return false;
  }
}

export async function subscriptionGuard(ctx: Context, next: NextFunction) {
  // Allow check_subscription callback through
  if (ctx.callbackQuery?.data === 'check_subscription') {
    return next();
  }

  const isSubscribed = await checkSubscription(ctx);
  if (!isSubscribed && config.channelId) {
    const channelLink = config.channelUsername
      ? `https://t.me/${config.channelUsername.replace('@', '')}`
      : `https://t.me/c/${config.channelId.replace('-100', '')}`;

    await ctx.reply(
      `📢 <b>Kanalga obuna bo'ling!</b>\n\n` +
      `Botdan foydalanish uchun avval kanalimizga obuna bo'lishingiz shart.\n` +
      `Obuna bo'lgach, «✅ Tekshirish» tugmasini bosing.`,
      {
        parse_mode: 'HTML',
        reply_markup: subscribeKeyboard(),
      },
    );
    return;
  }

  return next();
}
