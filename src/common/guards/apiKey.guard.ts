import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomException } from '../constant/custom-error';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const api_key =
      request.headers['api-key'] ||
      request.headers['api_key'] ||
      request.headers['API-key'];

    if (api_key && api_key === process.env.API_KEY) {
      return true;
    }
    throw new CustomException(
      'Access denied Api Key is incorrect',
      undefined,
      401,
    );
  }
}
