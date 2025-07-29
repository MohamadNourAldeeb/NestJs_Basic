import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { enumTypeOfRole } from '../enums/enums';
import { CustomException } from '../constant/custom-error';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user.role == enumTypeOfRole.User) {
      return true;
    } else throw new CustomException('Access denied', undefined, 403);
  }
}
