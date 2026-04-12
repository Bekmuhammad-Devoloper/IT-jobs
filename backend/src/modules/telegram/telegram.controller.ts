import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('check-subscription/:telegramId')
  @ApiOperation({ summary: 'Check user channel subscription' })
  async checkSubscription(@Param('telegramId') telegramId: string) {
    const isSubscribed = await this.telegramService.checkSubscription(BigInt(telegramId));
    return { subscribed: isSubscribed };
  }
}
