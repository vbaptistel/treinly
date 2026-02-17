import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SupabaseAuthGuard } from './auth/auth.guard.js';
import { TenantGuard } from './auth/tenant.guard.js';
import { ServicesModule } from './services/services.module.js';
import { PublicModule } from './public/public.module.js';
import { MeModule } from './me/me.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { BillingModule } from './billing/billing.module.js';
import { SaasGuard } from './auth/saas.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    ServicesModule,
    PublicModule,
    MeModule,
    AppointmentsModule,
    CustomersModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: SaasGuard },
  ],
})
export class AppModule {}
