import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service.js';
import { Public } from '../auth/decorators.js';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.publicService.findTenantBySlug(slug);
  }
}
