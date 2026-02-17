import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async findTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true,
        rules: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const services = await this.prisma.service.findMany({
      where: { tenantId: tenant.id, active: true },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        slotMinutes: true,
        minNoticeMinutes: true,
        priceCents: true,
      },
      orderBy: { name: 'asc' },
    });

    const { id: _, ...tenantData } = tenant;

    return { tenant: tenantData, services };
  }
}
