import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import type { CreateCustomer, CreatePlan } from '@treinly/validation';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  findAll(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        plans: { orderBy: { createdAt: 'desc' } },
        appointments: {
          orderBy: { startAt: 'desc' },
          take: 20,
          include: {
            service: { select: { name: true } },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async create(tenantId: string, data: CreateCustomer) {
    const phoneE164 = normalizePhoneE164(data.phone);

    return this.prisma.customer.upsert({
      where: {
        tenantId_phoneE164: { tenantId, phoneE164 },
      },
      update: {
        fullName: data.fullName,
        ...(data.email ? { email: data.email } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      },
      create: {
        tenantId,
        fullName: data.fullName,
        phoneE164,
        email: data.email || null,
        notes: data.notes || null,
      },
    });
  }

  async createPlan(tenantId: string, customerId: string, data: CreatePlan) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return this.prisma.customerPlan.create({
      data: {
        tenantId,
        customerId,
        type: data.type,
        sessionsTotal: data.sessionsTotal,
        validUntil: new Date(data.validUntil),
      },
    });
  }

  async invite(tenantId: string, customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (customer.userId) {
      throw new ConflictException('Cliente já possui conta');
    }

    if (!customer.email) {
      throw new BadRequestException('Cliente precisa ter email cadastrado para ser convidado');
    }

    const { id: userId } = await this.supabaseService.findOrCreateUserByEmail(customer.email);

    return this.prisma.customer.update({
      where: { id: customerId },
      data: { userId },
    });
  }
}

function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }
  return `+55${digits}`;
}
