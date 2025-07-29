import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../constant/custom-error';

@Injectable()
export class serialCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      let deviceSerial: any =
        req.headers['device-serial'] || req.headers['device_serial'];
      if (!deviceSerial)
        throw new CustomException(
          'device serial not exists, please set device serial in headers and try again 🚬',
        );

      req.device_serial = deviceSerial;
      return next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
