import { Controller, Post, Get, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TelegramAuthDto, AdminLoginDto } from './dto/telegram-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @ApiOperation({ summary: 'Authenticate via Telegram WebApp initData' })
  async telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.validateTelegramWebApp(dto.initData);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.validateAdminLogin(dto.telegramId, dto.secretKey);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException();
    const token = authHeader.replace('Bearer ', '');
    return this.authService.getUserFromToken(token);
  }
}
