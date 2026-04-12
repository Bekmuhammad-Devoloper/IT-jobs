import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get public statistics' })
  getPublicStats() {
    return this.statisticsService.getPublicStats();
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  getAdminStats() {
    return this.statisticsService.getAdminStats();
  }

  @Get('top-posts')
  @ApiOperation({ summary: 'Get top viewed posts' })
  getTopPosts(@Query('limit') limit?: number) {
    return this.statisticsService.getTopPosts(limit || 10);
  }
}
