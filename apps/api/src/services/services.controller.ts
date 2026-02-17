import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { CurrentTenantId } from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  CreateServiceSchema,
  UpdateServiceSchema,
} from '@treinly/validation';
import type { CreateService, UpdateService } from '@treinly/validation';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@CurrentTenantId() tenantId: string) {
    return this.servicesService.findAll(tenantId);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateServiceSchema))
  create(
    @CurrentTenantId() tenantId: string,
    @Body() data: CreateService,
  ) {
    return this.servicesService.create(tenantId, data);
  }

  @Patch(':id')
  update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateServiceSchema)) data: UpdateService,
  ) {
    return this.servicesService.update(tenantId, id, data);
  }

  @Delete(':id')
  remove(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.servicesService.remove(tenantId, id);
  }
}
