import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import type { InviteMember, UpdateMemberRole } from '@treinly/validation';

@Injectable()
export class TenantMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  findAll(tenantId: string) {
    return this.prisma.tenantUser.findMany({
      where: { tenantId },
      select: { userId: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(tenantId: string, data: InviteMember) {
    const existing = await this.prisma.tenantUser.findFirst({
      where: { tenantId, email: data.email },
    });
    if (existing) {
      throw new ConflictException('Este email já é membro deste tenant');
    }

    const adminAppUrl = this.configService.get<string>('ADMIN_APP_URL');
    const redirectTo = adminAppUrl
      ? `${adminAppUrl.replace(/\/$/, '')}/auth/confirmar-convite`
      : undefined;
    const user = await this.supabase.inviteUserByEmail(data.email, {
      redirectTo,
    });

    return this.prisma.tenantUser.create({
      data: {
        tenantId,
        userId: user.id,
        role: data.role ?? 'MEMBER',
        email: user.email,
      },
      select: { userId: true, email: true, role: true, createdAt: true },
    });
  }

  async updateRole(
    tenantId: string,
    targetUserId: string,
    data: UpdateMemberRole,
    currentUserId: string,
  ) {
    const tenantUser = await this.prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });
    if (!tenantUser) {
      throw new NotFoundException('Membro não encontrado');
    }
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Não é possível alterar o próprio role');
    }

    return this.prisma.tenantUser.update({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
      data: { role: data.role },
      select: { userId: true, email: true, role: true, createdAt: true },
    });
  }

  async remove(tenantId: string, targetUserId: string, currentUserId: string) {
    const tenantUser = await this.prisma.tenantUser.findUnique({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });
    if (!tenantUser) {
      throw new NotFoundException('Membro não encontrado');
    }
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Não é possível remover a si mesmo');
    }
    if (tenantUser.role === 'OWNER') {
      const ownerCount = await this.prisma.tenantUser.count({
        where: { tenantId, role: 'OWNER' },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException(
          'Não é possível remover o último OWNER do tenant',
        );
      }
    }

    await this.prisma.tenantUser.delete({
      where: { tenantId_userId: { tenantId, userId: targetUserId } },
    });
  }
}
