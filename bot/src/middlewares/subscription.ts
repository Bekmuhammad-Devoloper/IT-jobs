import { Context } from 'grammy';
import { config } from '../config';

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
