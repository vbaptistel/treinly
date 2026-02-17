import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}

  async getMe(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true,
        rules: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    const subscription = await this.prisma.saasSubscription.findUnique({
      where: { tenantId },
      select: {
        status: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      },
    });

    return {
      tenant,
      subscription: subscription ?? null,
    };
  }
}
