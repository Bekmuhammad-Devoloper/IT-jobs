import { Bot } from 'grammy';
import { config } from './config';
import { handleStart, handleHelp, handleStats, handleProfile } from './handlers/commands';
import { handleCallbackQuery } from './handlers/callbacks';
import { subscriptionGuard } from './middlewares/subscription';

async function main() {
  const bot = new Bot(config.botToken);

  // Error handling
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  // Global subscription check — every message/callback must pass
  bot.use(subscriptionGuard);

  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);

  // Text handlers
  bot.hears('� Statistika', handleStats);
  bot.hears('💡 Yordam', handleHelp);
  bot.hears('👤 Mening profilim', handleProfile);

  // Callback queries
  bot.on('callback_query:data', handleCallbackQuery);

  // Set bot commands menu
  await bot.api.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish' },
    { command: 'help', description: 'Yordam' },
  ]);

  // Set Menu button → "Yuksalish.dev" web app
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Yuksalish.dev',
      web_app: { url: config.webAppUrl },
    },
  });

  console.log('🤖 Yuksalish.dev Bot is starting...');
  await bot.start();
}

main().catch(console.error);
