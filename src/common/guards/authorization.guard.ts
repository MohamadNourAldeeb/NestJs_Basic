import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPermission } from 'src/user/entities/user_permission.entity';
import { CustomException } from '../constant/custom-error';
import { RolePermission } from 'src/role/entities/roles_permissions.entity';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const permission = this.reflector.getAllAndOverride<number[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const rolePermissions: any = await RolePermission.findAll({
      raw: true,
      where: { role_id: user.role_id },
    });

    const customPermissions: any = await UserPermission.findAll({
      raw: true,
      where: { user_id: user.id },
    });

    const permissionIds = rolePermissions.map(
      (role: any) => role.permission_id,
    );
    const userPermissionsId = customPermissions.map(
      (user: any) => user.permission_id,
    );

    if (
      !permissionIds.includes(permission[0]) &&
      !userPermissionsId.includes(permission[0])
    )
      throw new CustomException('Access denied', undefined, 403);

    return true;
  }
}
