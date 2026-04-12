import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  channelId: process.env.CHANNEL_ID || '',
  channelUsername: process.env.CHANNEL_USERNAME || '@Yuksalishdev_ITjobs',
  webAppUrl: process.env.WEBAPP_URL || 'https://it-jobs.bekmuhammad.uz',
  apiUrl: process.env.API_URL || 'http://localhost:3002/api',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};
