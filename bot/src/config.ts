import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  channelId: process.env.CHANNEL_ID || '',
  webAppUrl: process.env.WEBAPP_URL || 'https://itjobs.uz',
  apiUrl: process.env.API_URL || 'http://localhost:3002/api',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
};
