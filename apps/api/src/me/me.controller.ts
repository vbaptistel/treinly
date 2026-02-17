import { Controller, Get } from '@nestjs/common';
import { MeService } from './me.service.js';
import { CurrentTenantId } from '../auth/decorators.js';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(@CurrentTenantId() tenantId: string) {
    return this.meService.getMe(tenantId);
  }
}
