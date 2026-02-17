import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CurrentTenantId } from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { CreateCustomerSchema, CreatePlanSchema } from '@treinly/validation';
import type { CreateCustomer, CreatePlan } from '@treinly/validation';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@CurrentTenantId() tenantId: string) {
    return this.customersService.findAll(tenantId);
  }

  @Post()
  create(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(CreateCustomerSchema)) data: CreateCustomer,
  ) {
    return this.customersService.create(tenantId, data);
  }

  @Get(':id')
  findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(tenantId, id);
  }

  @Post(':id/plans')
  createPlan(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreatePlanSchema)) data: CreatePlan,
  ) {
    return this.customersService.createPlan(tenantId, id, data);
  }
}
