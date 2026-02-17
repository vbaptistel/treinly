import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TenantMembersService } from './tenant-members.service.js';
import {
  CurrentTenantId,
  CurrentTenantRole,
  CurrentUser,
  Roles,
} from '../auth/decorators.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  InviteMemberSchema,
  UpdateMemberRoleSchema,
} from '@treinly/validation';
import type { InviteMember, UpdateMemberRole } from '@treinly/validation';
import type { Role } from '../generated/prisma/enums.js';

@Controller('tenant-members')
@Roles('OWNER', 'PLATFORM_ADMIN')
export class TenantMembersController {
  constructor(private readonly tenantMembersService: TenantMembersService) {}

  private resolveTargetTenantId(
    guardTenantId: string | null,
    guardRole: Role,
    queryTenantId?: string,
  ): string {
    if (guardRole === 'PLATFORM_ADMIN') {
      if (queryTenantId) return queryTenantId;
      if (!guardTenantId) {
        throw new BadRequestException(
          'Query param tenantId é obrigatório para PLATFORM_ADMIN',
        );
      }
    }
    return guardTenantId!;
  }

  @Get()
  findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentTenantRole() role: Role,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const targetTenantId = this.resolveTargetTenantId(
      tenantId,
      role,
      queryTenantId,
    );
    return this.tenantMembersService.findAll(targetTenantId);
  }

  @Post()
  invite(
    @CurrentTenantId() tenantId: string,
    @CurrentTenantRole() role: Role,
    @Body(new ZodValidationPipe(InviteMemberSchema)) data: InviteMember,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const targetTenantId = this.resolveTargetTenantId(
      tenantId,
      role,
      queryTenantId,
    );
    return this.tenantMembersService.invite(targetTenantId, data);
  }

  @Patch(':userId')
  updateRole(
    @CurrentTenantId() tenantId: string,
    @CurrentTenantRole() role: Role,
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateMemberRoleSchema)) data: UpdateMemberRole,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const targetTenantId = this.resolveTargetTenantId(
      tenantId,
      role,
      queryTenantId,
    );
    return this.tenantMembersService.updateRole(
      targetTenantId,
      userId,
      data,
      user.id,
    );
  }

  @Delete(':userId')
  remove(
    @CurrentTenantId() tenantId: string,
    @CurrentTenantRole() role: Role,
    @CurrentUser() user: { id: string },
    @Param('userId') userId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const targetTenantId = this.resolveTargetTenantId(
      tenantId,
      role,
      queryTenantId,
    );
    return this.tenantMembersService.remove(targetTenantId, userId, user.id);
  }
}
