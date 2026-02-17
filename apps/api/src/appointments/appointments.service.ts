import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PrismaClient } from '@treinly/db';
import type { AppointmentsQuery, PatchAppointment } from '@treinly/validation';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: AppointmentsQuery) {
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        startAt: {
          gte: new Date(query.from),
          lte: new Date(query.to),
        },
      },
      include: {
        service: { select: { name: true } },
        customer: { select: { fullName: true, phoneE164: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async findPending(tenantId: string) {
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        billingStatus: 'PENDING',
        status: 'BOOKED',
      },
      include: {
        service: { select: { name: true } },
        customer: { select: { fullName: true, phoneE164: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async patch(tenantId: string, id: string, data: PatchAppointment) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    switch (data.action) {
      case 'cancel':
        return this.cancelAsAdmin(appointment, data.reason);
      case 'no_show':
        return this.markNoShow(appointment);
      case 'done':
        return this.markDone(appointment);
      case 'set_billing':
        return this.setBilling(appointment, data.billingStatus);
      default:
        throw new BadRequestException('Ação inválida');
    }
  }

  private async cancelAsAdmin(
    appointment: { id: string; tenantId: string; status: string; billingStatus: string },
    reason?: string,
  ) {
    if (appointment.status !== 'BOOKED') {
      throw new ConflictException('Apenas agendamentos BOOKED podem ser cancelados');
    }

    return this.prisma.$transaction(async (tx: PrismaClient) => {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          canceledBy: 'ADMIN',
          canceledReason: reason ?? null,
        },
      });

      // Refund session if COVERED
      if (appointment.billingStatus === 'COVERED') {
        const ledgerEntry = await tx.planSessionLedger.findFirst({
          where: {
            appointmentId: appointment.id,
            reason: 'BOOKED_CONSUME',
          },
        });

        if (ledgerEntry) {
          await tx.customerPlan.update({
            where: { id: ledgerEntry.customerPlanId },
            data: { sessionsUsed: { decrement: 1 } },
          });

          await tx.planSessionLedger.create({
            data: {
              tenantId: appointment.tenantId,
              customerPlanId: ledgerEntry.customerPlanId,
              appointmentId: appointment.id,
              delta: 1,
              reason: 'CANCELED_REFUND',
            },
          });
        }
      }

      return { status: 'CANCELED' };
    });
  }

  private async markNoShow(appointment: { id: string; status: string }) {
    if (appointment.status !== 'BOOKED') {
      throw new ConflictException('Apenas agendamentos BOOKED podem ser marcados como no-show');
    }

    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'NO_SHOW' },
    });

    return { status: 'NO_SHOW' };
  }

  private async markDone(appointment: { id: string; status: string }) {
    if (appointment.status !== 'BOOKED') {
      throw new ConflictException('Apenas agendamentos BOOKED podem ser marcados como realizados');
    }

    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'DONE' },
    });

    return { status: 'DONE' };
  }

  private async setBilling(
    appointment: { id: string; billingStatus: string },
    billingStatus?: string,
  ) {
    if (!billingStatus || !['PAID_MANUAL', 'WAIVED'].includes(billingStatus)) {
      throw new BadRequestException('billingStatus deve ser PAID_MANUAL ou WAIVED');
    }

    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { billingStatus: billingStatus as any },
    });

    return { billingStatus };
  }
}
