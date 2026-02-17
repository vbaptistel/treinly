import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateService, UpdateService } from '@treinly/validation';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.service.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  create(tenantId: string, data: CreateService) {
    return this.prisma.service.create({
      data: { ...data, tenantId },
    });
  }

  async update(tenantId: string, id: string, data: UpdateService) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId, active: true },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, tenantId, active: true },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return this.prisma.service.update({
      where: { id },
      data: { active: false },
    });
  }
}
