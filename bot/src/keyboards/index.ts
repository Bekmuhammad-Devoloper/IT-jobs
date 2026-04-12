import { InlineKeyboard, Keyboard } from 'grammy';
import { config } from '../config';

export const mainKeyboard = () => {
  return new Keyboard()
    .webApp('💻 Yuksalish.dev', config.webAppUrl)
    .row()
    .text('📊 Statistika')
    .text('ℹ️ Yordam')
    .row()
    .text('👤 Mening profilim')
    .resized()
    .persistent();
};

export const subscribeKeyboard = () => {
  const channelLink = config.channelUsername
    ? `https://t.me/${config.channelUsername.replace('@', '')}`
    : `https://t.me/c/${config.channelId.replace('-100', '')}`;

  return new InlineKeyboard()
    .url('📢 Kanalga obuna bo\'lish', channelLink)
    .row()
    .text('✅ Tekshirish', 'check_subscription');
};

export const webAppKeyboard = () => {
  return new InlineKeyboard()
    .webApp('💼 Vakansiyalar', `${config.webAppUrl}/posts?type=VACANCY`)
    .webApp('📋 Rezyumelar', `${config.webAppUrl}/posts?type=RESUME`)
    .row()
    .webApp('📚 Kurslar', `${config.webAppUrl}/posts?type=COURSE`)
    .webApp('🧑‍💻 Mentorlar', `${config.webAppUrl}/posts?type=MENTOR`)
    .row()
    .webApp('🎓 Stajirovkalar', `${config.webAppUrl}/posts?type=INTERNSHIP`)
    .webApp('⚙️ Xizmatlar', `${config.webAppUrl}/services`);
};

export const adminNotifyKeyboard = (postId: number) => {
  return new InlineKeyboard()
    .text('✅ Tasdiqlash', `approve_${postId}`)
    .text('❌ Rad etish', `reject_${postId}`);
};
