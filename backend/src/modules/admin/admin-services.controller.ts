import {
  Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Admin - Services')
@Controller('admin/services')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class AdminServicesController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  getServices() {
    return this.adminService.getServices();
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  createService(@Body() data: { title: string; slug?: string; description?: string; price?: string; icon?: string; link?: string; order?: number }) {
    return this.adminService.createService(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  updateService(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.adminService.updateService(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  deleteService(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteService(id);
  }
}
