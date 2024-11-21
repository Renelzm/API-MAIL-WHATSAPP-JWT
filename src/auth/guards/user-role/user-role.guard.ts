import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

constructor(
  private readonly reflector: Reflector
) {
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const req = context.switchToHttp().getRequest();
    const rol = req.user.rol.nombre_rol
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());
    
    if (!validRoles) {
      return false;
    }
    if ( validRoles.includes(rol)) {
      return true;
    }
    
    return false;
  }
}
