import { Module } from '@nestjs/common';
import { TenantMembersController } from './tenant-members.controller.js';
import { TenantMembersService } from './tenant-members.service.js';

@Module({
  controllers: [TenantMembersController],
  providers: [TenantMembersService],
})
export class TenantMembersModule {}
