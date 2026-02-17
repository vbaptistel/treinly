import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { CurrentTenantId } from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  AppointmentsQuerySchema,
  PatchAppointmentSchema,
} from '@treinly/validation';
import type { AppointmentsQuery, PatchAppointment } from '@treinly/validation';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(
    @CurrentTenantId() tenantId: string,
    @Query(new ZodValidationPipe(AppointmentsQuerySchema)) query: AppointmentsQuery,
  ) {
    return this.appointmentsService.findAll(tenantId, query);
  }

  @Get('pending')
  findPending(@CurrentTenantId() tenantId: string) {
    return this.appointmentsService.findPending(tenantId);
  }

  @Patch(':id')
  patch(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(PatchAppointmentSchema)) data: PatchAppointment,
  ) {
    return this.appointmentsService.patch(tenantId, id, data);
  }
}
