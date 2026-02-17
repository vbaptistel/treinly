import { Controller, Post, RawBody, Headers } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { CurrentTenantId, Public } from '../auth/decorators.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout-session')
  createCheckoutSession(@CurrentTenantId() tenantId: string) {
    return this.billingService.createCheckoutSession(tenantId);
  }

  @Public()
  @Post('webhook')
  handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
