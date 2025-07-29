import { SetMetadata } from '@nestjs/common';
import { enumTypeOfRole } from '../enums/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: enumTypeOfRole[]) =>
  SetMetadata(ROLES_KEY, roles);
