import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './auth.guard.js';
import { TenantGuard } from './tenant.guard.js';

@Module({
  providers: [SupabaseAuthGuard, TenantGuard],
  exports: [SupabaseAuthGuard, TenantGuard],
})
export class AuthModule {}
