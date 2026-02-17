import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { PublicService } from './public.service.js';
import { Public } from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  AvailabilityQuerySchema,
  PublicCreateAppointmentSchema,
  PublicCancelAppointmentSchema,
} from '@treinly/validation';
import type {
  AvailabilityQuery,
  PublicCreateAppointment,
  PublicCancelAppointment,
} from '@treinly/validation';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // Manage routes first (more specific, avoids :slug catching "appointments")
  @Public()
  @Get('appointments/manage/:token')
  getAppointmentByToken(@Param('token') token: string) {
    return this.publicService.getAppointmentByToken(token);
  }

  @Public()
  @Post('appointments/manage/:token/cancel')
  cancelAppointment(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(PublicCancelAppointmentSchema)) data: PublicCancelAppointment,
  ) {
    return this.publicService.cancelAppointmentByToken(token, data);
  }

  // Slug-based routes
  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.publicService.findTenantBySlug(slug);
  }

  @Public()
  @Get(':slug/availability')
  getAvailability(
    @Param('slug') slug: string,
    @Query(new ZodValidationPipe(AvailabilityQuerySchema)) query: AvailabilityQuery,
  ) {
    return this.publicService.getAvailability(slug, query);
  }

  @Public()
  @Post(':slug/appointments')
  createAppointment(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(PublicCreateAppointmentSchema)) data: PublicCreateAppointment,
  ) {
    return this.publicService.createAppointment(slug, data);
  }
}
