import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    // Dual-Role logic: check activeRole first, then fallback to base role
    // A TEACHER can always act as STUDENT; check against activeRole for UI-mode gating
    const effectiveRole = user.activeRole || user.role;
    return requiredRoles.some(
      (r) => r === effectiveRole || r === user.role
    );
  }
}
