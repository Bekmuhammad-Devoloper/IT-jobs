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

  // Global subscription check
  bot.use(subscriptionGuard);

  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);

  // Text handlers (must match keyboard button text exactly)
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

  // Set Menu button text to "Yuksalish.dev"
  await bot.api.setChatMenuButton({
    menu_button: {
      type: 'web_app',
      text: 'Yuksalish.dev',
      web_app: { url: config.webAppUrl },
    },
  });

  console.log('🚀 Yuksalish.dev Bot is starting...');
  await bot.start();
}

main().catch(console.error);
