import {
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../constant/custom-error';

import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { InjectModel } from '@nestjs/sequelize';
import { JWTService } from '../services/jwt.service';
import { RedisService } from '../services/redis.service';
import { UserAgent } from 'express-useragent';
import { UserDevice } from 'src/user/entities/user_device.entity';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        email: string;
        phone_number: string;
        device_id: string;
        language_id: number;
        role_id: number;
      };
      useragent?: UserAgent;
      device_serial?: string;
    }
  }
}

@Injectable()
export class authenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtServices: JWTService,
    @InjectModel(UserRefreshToken)
    private userRefreshTokenRepository: typeof UserRefreshToken,
    @InjectModel(UserDevice)
    private userDeviceRepository: typeof UserDevice,
    private readonly cacheManager: RedisService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      let rawToken: any =
        req.headers.authorization || req.headers.Authorization;
      if (!rawToken)
        throw new CustomException(
          'Token not exists, please set token and  try again',
        );

      if (rawToken.startsWith('Bearer '))
        rawToken = rawToken.replace('Bearer ', '');

      let decoded: any = await this.jwtServices.verifyToken(
        rawToken,
        process.env.TOKEN_SECRET_KEY as string,
      );

      if (!decoded)
        throw new CustomException('bad token', HttpStatus.UNAUTHORIZED);

      const isLogOut: any = await this.userRefreshTokenRepository.findOne({
        raw: true,
        nest: true,
        include: [
          {
            model: this.userDeviceRepository,
            required: true,
            attributes: ['serial'],
          },
        ],
        where: {
          user_id: decoded.id,
          device_id: decoded.device_id,
        },
      });
      if (!isLogOut)
        throw new CustomException(
          'You have logged out',
          HttpStatus.UNAUTHORIZED,
        );

      const storedJti: string | null =
        await this.cacheManager.getFromRedisCache(`${isLogOut.id}`);

      if (decoded.jti != storedJti)
        throw new CustomException(
          'your token is old or forbidden please login again',
          HttpStatus.UNAUTHORIZED,
        );
      if (req.device_serial != isLogOut.device.serial)
        throw new CustomException(
          'This token is not for your device , from where you get it !??',
          HttpStatus.UNAUTHORIZED,
        );
      req.user = {
        id: decoded.id,
        role_id: decoded.role_id,
        language_id: decoded.language_id,
        device_id: decoded.device_id,
        email: decoded.email,
        phone_number: decoded.phone_number,
      };

      return next();
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
