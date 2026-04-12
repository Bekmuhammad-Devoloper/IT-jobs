import {
  Controller, Get, Put, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Admin - Settings')
@Controller('admin/settings')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminSettingsController {
  constructor(private readonly adminService: AdminService) {}

  // ── Settings ──────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update a setting' })
  updateSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.adminService.updateSetting(key, value);
  }

  // ── Categories ──────────────────────────────────────────
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create category' })
  createCategory(@Body() data: { name: string; slug: string; type: string; order?: number }) {
    return this.adminService.createCategory(data);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update category' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; slug?: string; isActive?: boolean; order?: number },
  ) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category' })
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // ── Technologies ──────────────────────────────────────────
  @Get('technologies')
  @ApiOperation({ summary: 'Get all technologies' })
  getTechnologies() {
    return this.adminService.getTechnologies();
  }

  @Post('technologies')
  @ApiOperation({ summary: 'Create technology' })
  createTechnology(@Body() data: { name: string; category: string }) {
    return this.adminService.createTechnology(data);
  }

  @Delete('technologies/:id')
  @ApiOperation({ summary: 'Delete technology' })
  deleteTechnology(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteTechnology(id);
  }
}
