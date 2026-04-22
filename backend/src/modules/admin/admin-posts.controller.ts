import {
  Controller, Get, Delete, Patch, Param, Query, Body, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PostStatus } from '@prisma/client';

@ApiTags('Admin - Posts')
@Controller('admin/posts')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminPostsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts (admin)' })
  getPosts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PostStatus,
    @Query('type') type?: string,
  ) {
    return this.adminService.getPosts(page || 1, limit || 20, status, type);
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Update post rating (admin)' })
  updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body('rating') rating: number,
  ) {
    return this.adminService.updatePostRating(id, rating);
  }

  @Patch(':id/order')
  @ApiOperation({ summary: 'Update post pinned order (admin)' })
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body('pinnedOrder') pinnedOrder: number | null,
  ) {
    return this.adminService.updatePostOrder(id, pinnedOrder ?? null);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post (admin)' })
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deletePost(id);
  }
}
