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
    const userId = request.user?.id;
    if (!userId) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const tenantUser = await this.prismaService.tenantUser.findFirst({
      where: { userId },
    });

    if (!tenantUser) {
      throw new ForbiddenException('Usuário não pertence a nenhum tenant');
    }

    request.tenantId = tenantUser.tenantId;
    request.tenantRole = tenantUser.role;
    return true;
  }
}
