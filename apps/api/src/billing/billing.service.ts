import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private webhookSecret: string;
  private priceId: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    this.priceId = this.config.getOrThrow<string>('STRIPE_PRICE_ID');
  }

  async createCheckoutSession(tenantId: string) {
    const subscription = await this.prisma.saasSubscription.findUnique({
      where: { tenantId },
    });

    let customerId = subscription?.gatewayCustomerId;

    // Create Stripe customer if not yet linked
    if (!customerId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, slug: true },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant não encontrado');
      }

      const customer = await this.stripe.customers.create({
        name: tenant.name,
        metadata: { tenantId, slug: tenant.slug },
      });

      customerId = customer.id;

      await this.prisma.saasSubscription.upsert({
        where: { tenantId },
        update: { gatewayCustomerId: customerId },
        create: {
          tenantId,
          status: 'TRIAL',
          gatewayCustomerId: customerId,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60_000),
        },
      });
    }

    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: `${appUrl}/app?billing=success`,
      cancel_url: `${appUrl}/app?billing=cancel`,
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch {
      throw new BadRequestException('Assinatura de webhook inválida');
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.syncSubscription(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.syncSubscription(sub);
        break;
      }
    }

    return { received: true };
  }

  private async syncSubscription(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    // Find tenant by gateway_customer_id
    const existing = await this.prisma.saasSubscription.findFirst({
      where: { gatewayCustomerId: customerId },
    });

    if (!existing) return;

    const status = this.mapStripeStatus(sub.status);
    const firstItem = sub.items?.data?.[0];
    const currentPeriodEnd = firstItem
      ? new Date(firstItem.current_period_end * 1000)
      : undefined;

    await this.prisma.saasSubscription.update({
      where: { tenantId: existing.tenantId },
      data: {
        status,
        gatewaySubscriptionId: sub.id,
        currentPeriodEnd,
      },
    });
  }

  private mapStripeStatus(
    stripeStatus: Stripe.Subscription.Status,
  ): 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' {
    switch (stripeStatus) {
      case 'trialing':
        return 'TRIAL';
      case 'active':
        return 'ACTIVE';
      case 'past_due':
        return 'PAST_DUE';
      case 'canceled':
      case 'unpaid':
        return 'CANCELED';
      case 'incomplete_expired':
        return 'EXPIRED';
      default:
        return 'ACTIVE';
    }
  }
}
