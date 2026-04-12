import {
  Controller, Get, Put, Param, Query, UseGuards, ParseIntPipe, Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (admin)' })
  getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
    @Query('role') role?: UserRole,
  ) {
    return this.adminService.getUsers(page || 1, limit || 20, q, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Put(':id/block')
  @ApiOperation({ summary: 'Block user' })
  blockUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.blockUser(id);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.unblockUser(id);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Set user role' })
  setRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: UserRole) {
    return this.adminService.setUserRole(id, role);
  }
}
