import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';
import { IS_PUBLIC_KEY } from './decorators.js';

/**
 * Blocks panel requests when the tenant's SaaS subscription is
 * CANCELED or EXPIRED. PAST_DUE tenants get read-only access
 * (GET allowed, mutations blocked).
 *
 * Public routes and webhook routes bypass this guard.
 */
@Injectable()
export class SaasGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId: string | undefined = request.tenantId;
    if (!tenantId) return true; // no tenant resolved yet (shouldn't happen after TenantGuard)

    const subscription = await this.prisma.saasSubscription.findUnique({
      where: { tenantId },
      select: { status: true, trialEndsAt: true },
    });

    if (!subscription) {
      // No subscription record — allow (treat as new tenant, seed should fix)
      return true;
    }

    const { status } = subscription;

    // TRIAL: check expiry
    if (status === 'TRIAL') {
      if (subscription.trialEndsAt && subscription.trialEndsAt < new Date()) {
        throw new ForbiddenException({
          message: 'Período de teste expirado',
          subscriptionStatus: 'EXPIRED',
        });
      }
      return true;
    }

    // ACTIVE: full access
    if (status === 'ACTIVE') return true;

    // PAST_DUE: read-only (only GET allowed)
    if (status === 'PAST_DUE') {
      const method = request.method as string;
      if (method === 'GET') return true;
      throw new ForbiddenException({
        message: 'Assinatura com pagamento pendente. Apenas consultas permitidas.',
        subscriptionStatus: 'PAST_DUE',
      });
    }

    // CANCELED / EXPIRED: block everything
    throw new ForbiddenException({
      message: 'Assinatura inativa. Renove para continuar.',
      subscriptionStatus: status,
    });
  }
}
