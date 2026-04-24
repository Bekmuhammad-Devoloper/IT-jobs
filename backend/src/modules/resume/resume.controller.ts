import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ResumeService } from './resume.service';
import { GenerateResumeDto } from './dto/generate-resume.dto';
import { TelegramAuthGuard } from '../../common/guards/telegram-auth.guard';

@ApiTags('Resume')
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('generate')
  @UseGuards(TelegramAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Generate a resume with Gemini' })
  generate(@Body() dto: GenerateResumeDto) {
    return this.resumeService.generate(dto);
  }
}
