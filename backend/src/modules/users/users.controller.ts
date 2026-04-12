import { Controller, Get, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TelegramAuthGuard } from '../../common/guards/telegram-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(TelegramAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @UseGuards(TelegramAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('resumes')
  @ApiOperation({ summary: 'Get resumes list (top + recent)' })
  getResumes(
    @Query('top') top?: number,
    @Query('recent') recent?: number,
    @Query('q') q?: string,
    @Query('profession') profession?: string,
  ) {
    return this.usersService.getResumes({ top, recent, q, profession });
  }

  @Get('resumes/:id')
  @ApiOperation({ summary: 'Get resume by user ID' })
  getResumeById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getResumeById(id);
  }
}
