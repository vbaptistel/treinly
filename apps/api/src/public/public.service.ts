import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PrismaClient } from '@treinly/db';
import type { AvailabilityQuery, PublicCreateAppointment, PublicCancelAppointment } from '@treinly/validation';

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

  async getAvailability(slug: string, query: AvailabilityQuery) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, timezone: true },
    });

    if (!tenant) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const service = await this.prisma.service.findFirst({
      where: { id: query.serviceId, tenantId: tenant.id, active: true },
    });

    if (!service) {
      throw new BadRequestException('Serviço não encontrado');
    }

    const { timezone } = tenant;
    const { date } = query;

    // Build day boundaries in tenant's timezone, then convert to UTC
    const dayStartLocal = new Date(
      toLocalISO(date, '00:00:00', timezone),
    );
    const dayEndLocal = new Date(
      toLocalISO(date, '23:59:59.999', timezone),
    );

    // Determine weekday in tenant's local timezone (0=Sunday)
    const weekday = getWeekdayInTimezone(dayStartLocal, timezone);

    // Fetch availability rules for this weekday
    const rules = await this.prisma.tenantAvailabilityRule.findMany({
      where: { tenantId: tenant.id, weekday, active: true },
      orderBy: { startTime: 'asc' },
    });

    if (rules.length === 0) {
      return { date, slots: [] };
    }

    // Fetch time offs overlapping with this day
    const timeOffs = await this.prisma.tenantTimeOff.findMany({
      where: {
        tenantId: tenant.id,
        startAt: { lte: dayEndLocal },
        endAt: { gte: dayStartLocal },
      },
    });

    // Fetch existing BOOKED appointments for this day (using busy ranges)
    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId: tenant.id,
        status: 'BOOKED',
        busyStartAt: { lt: dayEndLocal },
        busyEndAt: { gt: dayStartLocal },
      },
      select: { busyStartAt: true, busyEndAt: true },
    });

    const now = new Date();
    const minNoticeThreshold = new Date(
      now.getTime() + service.minNoticeMinutes * 60_000,
    );

    const slots: string[] = [];

    for (const rule of rules) {
      // rule.startTime / rule.endTime are TIME columns — Prisma returns Date
      // with date part 1970-01-01. Extract HH:mm:ss.
      const ruleStart = extractTime(rule.startTime);
      const ruleEnd = extractTime(rule.endTime);

      // Convert rule window to UTC Date for the requested date
      const windowStart = new Date(
        toLocalISO(date, ruleStart, timezone),
      );
      const windowEnd = new Date(
        toLocalISO(date, ruleEnd, timezone),
      );

      // Generate slots within this window
      let cursor = windowStart.getTime();
      const slotStep = service.slotMinutes * 60_000;

      while (cursor + service.durationMinutes * 60_000 <= windowEnd.getTime()) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(
          cursor + service.durationMinutes * 60_000,
        );
        const busyStart = new Date(
          cursor - service.bufferBeforeMinutes * 60_000,
        );
        const busyEnd = new Date(
          slotEnd.getTime() + service.bufferAfterMinutes * 60_000,
        );

        // Check min notice
        if (slotStart < minNoticeThreshold) {
          cursor += slotStep;
          continue;
        }

        // Check time off overlap
        const overlapsTimeOff = timeOffs.some(
          (off) => busyStart < off.endAt && busyEnd > off.startAt,
        );
        if (overlapsTimeOff) {
          cursor += slotStep;
          continue;
        }

        // Check appointment overlap (busy ranges)
        const overlapsAppointment = appointments.some(
          (apt) => busyStart < apt.busyEndAt && busyEnd > apt.busyStartAt,
        );
        if (overlapsAppointment) {
          cursor += slotStep;
          continue;
        }

        slots.push(slotStart.toISOString());
        cursor += slotStep;
      }
    }

    return { date, slots };
  }

  async createAppointment(slug: string, data: PublicCreateAppointment) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, timezone: true },
    });

    if (!tenant) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const service = await this.prisma.service.findFirst({
      where: { id: data.serviceId, tenantId: tenant.id, active: true },
    });

    if (!service) {
      throw new BadRequestException('Serviço não encontrado');
    }

    // Phone normalization to E.164
    const phoneE164 = normalizePhoneE164(data.phone);

    // Calculate appointment times
    const startAt = new Date(data.startAt);
    const endAt = new Date(
      startAt.getTime() + service.durationMinutes * 60_000,
    );
    const busyStartAt = new Date(
      startAt.getTime() - service.bufferBeforeMinutes * 60_000,
    );
    const busyEndAt = new Date(
      endAt.getTime() + service.bufferAfterMinutes * 60_000,
    );

    // Generate manage token
    const publicManageToken = randomBytes(32).toString('hex');
    const publicManageTokenExpiresAt = new Date(
      startAt.getTime() + 30 * 24 * 60 * 60_000,
    );

    // Run everything in a transaction
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // Upsert customer by (tenant_id, phone_e164)
      const customer = await tx.customer.upsert({
        where: {
          tenantId_phoneE164: {
            tenantId: tenant.id,
            phoneE164: phoneE164,
          },
        },
        update: {
          fullName: data.fullName,
          ...(data.email ? { email: data.email } : {}),
        },
        create: {
          tenantId: tenant.id,
          fullName: data.fullName,
          phoneE164: phoneE164,
          email: data.email || null,
        },
      });

      // 1 booking per client per day (PUBLIC only) — uses tenant's local day
      const localDate = toDateStringInTimezone(startAt, tenant.timezone);
      const dayStart = new Date(
        toLocalISO(localDate, '00:00:00', tenant.timezone),
      );
      const dayEnd = new Date(
        toLocalISO(localDate, '23:59:59.999', tenant.timezone),
      );

      const existingToday = await tx.appointment.findFirst({
        where: {
          tenantId: tenant.id,
          customerId: customer.id,
          source: 'PUBLIC',
          status: 'BOOKED',
          startAt: { gte: dayStart, lte: dayEnd },
        },
      });

      if (existingToday) {
        throw new ConflictException(
          'Já existe um agendamento para este dia',
        );
      }

      // Find active plan with remaining sessions
      // Prisma can't compare two columns, so we fetch and filter in JS
      const planWithBalance = await tx.customerPlan.findFirst({
        where: {
          tenantId: tenant.id,
          customerId: customer.id,
          status: 'ACTIVE',
          validUntil: { gte: new Date() },
        },
        orderBy: { validUntil: 'asc' },
      });

      const hasPlanBalance =
        planWithBalance &&
        planWithBalance.sessionsUsed < planWithBalance.sessionsTotal;

      const billingStatus = hasPlanBalance ? 'COVERED' : 'PENDING';

      // Create appointment — EXCLUDE constraint handles overlap at DB level
      let appointment;
      try {
        appointment = await tx.appointment.create({
          data: {
            tenantId: tenant.id,
            customerId: customer.id,
            serviceId: service.id,
            startAt,
            endAt,
            busyStartAt,
            busyEndAt,
            source: 'PUBLIC',
            billingStatus,
            publicManageToken,
            publicManageTokenExpiresAt,
          },
        });
      } catch (err: any) {
        // Prisma wraps DB constraint violations
        if (
          err?.code === 'P2002' ||
          err?.message?.includes('appointments_no_overlap')
        ) {
          throw new ConflictException('Horário indisponível');
        }
        throw err;
      }

      // If plan with balance: consume session via ledger
      if (hasPlanBalance && planWithBalance) {
        await tx.customerPlan.update({
          where: { id: planWithBalance.id },
          data: { sessionsUsed: { increment: 1 } },
        });

        await tx.planSessionLedger.create({
          data: {
            tenantId: tenant.id,
            customerPlanId: planWithBalance.id,
            appointmentId: appointment.id,
            delta: -1,
            reason: 'BOOKED_CONSUME',
          },
        });
      }

      return {
        appointmentId: appointment.id,
        billingStatus: appointment.billingStatus,
        manageToken: publicManageToken,
        manageUrl: `/m/apt/${publicManageToken}`,
      };
    });
  }

  async getAppointmentByToken(token: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { publicManageToken: token },
      include: {
        service: { select: { name: true } },
        tenant: { select: { slug: true, rules: true } },
      },
    });

    if (
      !appointment ||
      !appointment.publicManageTokenExpiresAt ||
      appointment.publicManageTokenExpiresAt < new Date()
    ) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const rules = appointment.tenant.rules as { cancel_before_hours?: number };
    const cancelBeforeHours = rules.cancel_before_hours ?? 12;
    const cancelDeadline = new Date(
      appointment.startAt.getTime() - cancelBeforeHours * 60 * 60_000,
    );
    const canCancel =
      appointment.status === 'BOOKED' && new Date() < cancelDeadline;

    return {
      status: appointment.status,
      tenantSlug: appointment.tenant.slug,
      serviceName: appointment.service.name,
      startAt: appointment.startAt.toISOString(),
      canCancel,
      cancelBeforeHours,
    };
  }

  async cancelAppointmentByToken(token: string, data: PublicCancelAppointment) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { publicManageToken: token },
      include: {
        tenant: { select: { id: true, rules: true } },
      },
    });

    if (
      !appointment ||
      !appointment.publicManageTokenExpiresAt ||
      appointment.publicManageTokenExpiresAt < new Date()
    ) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.status !== 'BOOKED') {
      throw new ConflictException('Agendamento não pode ser cancelado');
    }

    const rules = appointment.tenant.rules as { cancel_before_hours?: number };
    const cancelBeforeHours = rules.cancel_before_hours ?? 12;
    const cancelDeadline = new Date(
      appointment.startAt.getTime() - cancelBeforeHours * 60 * 60_000,
    );

    if (new Date() >= cancelDeadline) {
      throw new ConflictException(
        `Cancelamento permitido até ${cancelBeforeHours}h antes do horário`,
      );
    }

    return this.prisma.$transaction(async (tx: PrismaClient) => {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
          canceledBy: 'PUBLIC',
          canceledReason: data.reason ?? null,
        },
      });

      // Refund session if billing was COVERED
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
              tenantId: appointment.tenant.id,
              customerPlanId: ledgerEntry.customerPlanId,
              appointmentId: appointment.id,
              delta: 1,
              reason: 'CANCELED_REFUND',
            },
          });
        }
      }

      return { status: 'CANCELED' as const };
    });
  }
}

/**
 * Normalize phone to E.164 format.
 * Strips non-digits, assumes Brazilian number if no country code.
 */
function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }
  // Assume Brazilian number
  return `+55${digits}`;
}

/**
 * Converts a local date + time string to a UTC ISO string using the given timezone.
 */
function toLocalISO(
  dateStr: string,
  timeStr: string,
  timezone: string,
): string {
  const targetLocal = new Date(`${dateStr}T${timeStr}Z`);
  const inTz = new Date(
    targetLocal.toLocaleString('en-US', { timeZone: timezone }),
  );
  const offset = inTz.getTime() - targetLocal.getTime();
  return new Date(targetLocal.getTime() - offset).toISOString();
}

/**
 * Extract HH:mm:ss from a Prisma TIME field (returned as Date with 1970-01-01).
 */
function extractTime(d: Date): string {
  const h = d.getUTCHours().toString().padStart(2, '0');
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const s = d.getUTCSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Get weekday (0=Sunday) for a given instant in a specific timezone.
 */
function getWeekdayInTimezone(date: Date, timezone: string): number {
  const str = date.toLocaleDateString('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[str] ?? 0;
}

/**
 * Get YYYY-MM-DD string for a Date in a specific timezone.
 */
function toDateStringInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return parts; // en-CA outputs YYYY-MM-DD
}
