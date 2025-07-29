import { SetMetadata } from '@nestjs/common';

export const Permission_KEY = 'permissions';
export const Permissions = (permissions: number[]) =>
  SetMetadata(Permission_KEY, permissions);
