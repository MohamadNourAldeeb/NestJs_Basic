import {
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../constant/custom-error';
import { getCountryFromIP } from '../utilis/helper';
import { RedisService } from '../services/redis.service';

@Injectable()
export class IpCountryMiddleware implements NestMiddleware {
  constructor(private readonly cacheManager: RedisService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const forwardedIp = req.headers['x-forwarded-for'][0] || req.ip;

      let ipCountry = await getCountryFromIP(forwardedIp);

      let ipCountryBlockList =
        await this.cacheManager.getFromRedisCache('ipCountryBlockList');

      ipCountryBlockList = JSON.parse(ipCountryBlockList);

      if (ipCountryBlockList.includes(ipCountry))
        throw new CustomException(
          'Your Country are blocked to use own app',
          HttpStatus.UNAUTHORIZED,
        );
      return next();
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
