import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CurrentTenantId } from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  CreateCustomerSchema,
  CreatePlanSchema,
  CustomersQuerySchema,
} from '@treinly/validation';
import type {
  CreateCustomer,
  CreatePlan,
  CustomersQuery,
} from '@treinly/validation';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(
    @CurrentTenantId() tenantId: string,
    @Query(new ZodValidationPipe(CustomersQuerySchema)) query: CustomersQuery,
  ) {
    return this.customersService.findAll(tenantId, query);
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

  @Post(':id/invite')
  invite(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.invite(tenantId, id);
  }
}
