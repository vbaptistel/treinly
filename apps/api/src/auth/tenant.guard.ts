import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';
import { IS_PUBLIC_KEY } from './decorators.js';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.id) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.platformRole === 'PLATFORM_ADMIN') {
      request.tenantId = null;
      request.tenantRole = 'PLATFORM_ADMIN';
      return true;
    }

    const tenantUser = await this.prismaService.tenantUser.findFirst({
      where: { userId: user.id },
    });

    if (!tenantUser) {
      throw new ForbiddenException('Usuário não pertence a nenhum tenant');
    }

    request.tenantId = tenantUser.tenantId;
    request.tenantRole = tenantUser.role;
    return true;
  }
}
