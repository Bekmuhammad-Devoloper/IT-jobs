import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TelegramAuthDto {
  @ApiProperty({ description: 'Telegram WebApp initData string' })
  @IsNotEmpty()
  @IsString()
  initData: string;
}

export class AdminLoginDto {
  @ApiProperty({ description: 'Admin Telegram ID' })
  @IsNotEmpty()
  @IsString()
  telegramId: string;

  @ApiProperty({ description: 'Admin secret key' })
  @IsNotEmpty()
  @IsString()
  secretKey: string;
}
