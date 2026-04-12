import { Bot } from 'grammy';
import { config } from './config';
import { handleStart, handleHelp, handleStats, handleProfile } from './handlers/commands';
import { handleCallbackQuery } from './handlers/callbacks';

async function main() {
  const bot = new Bot(config.botToken);

  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);

  // Text handlers
  bot.hears('📊 Statistika', handleStats);
  bot.hears('ℹ️ Yordam', handleHelp);
  bot.hears('👤 Mening profilim', handleProfile);

  // Callback queries
  bot.on('callback_query:data', handleCallbackQuery);

  // Set bot commands menu
  await bot.api.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish' },
    { command: 'help', description: 'Yordam' },
  ]);

  console.log('🤖 IT Jobs Bot is starting...');
  await bot.start();
}

main().catch(console.error);
