import {
  Controller, Get, Put, Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Admin - Moderation')
@Controller('admin/moderation')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminModerationController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get pending posts for moderation' })
  getPendingPosts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPendingPosts(page || 1, limit || 20);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve a post' })
  approvePost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approvePost(id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a post' })
  rejectPost(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectPost(id, reason);
  }
}
