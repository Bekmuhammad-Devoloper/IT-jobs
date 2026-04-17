import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true, parentId: null },
      include: { children: { where: { isActive: true }, orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, isActive: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
