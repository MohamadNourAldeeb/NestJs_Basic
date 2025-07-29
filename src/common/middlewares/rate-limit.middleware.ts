import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly generalLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    statusCode: 429,
    keyGenerator: (req) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        const ip = Array.isArray(forwardedFor)
          ? forwardedFor[0].trim()
          : forwardedFor.split(',')[0].trim();
        return ip;
      }
      return req.ip || 'unknown';
    },
    message: {
      success: false,
      data: {
        message:
          'Too many requests from this IP, please try again after 2 minutes ',
      },
    },
  });
  private readonly loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 25,
    standardHeaders: true,
    statusCode: 429,
    keyGenerator: (req) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        if (Array.isArray(forwardedFor)) {
          return forwardedFor[0];
        }
        return forwardedFor.split(',')[0].trim();
      }
      return req.ip || 'unknown';
    },
    message: {
      success: false,
      data: {
        message:
          'Too many requests from this IP, please try again after 2 minutes ',
      },
    },
  });
  async use(req: Request, res: Response, next: NextFunction) {
    let limiter: any;
    let path = req.path.split('/')[1];
    if (path == 'sign-in') limiter = this.loginLimiter;
    else limiter = this.generalLimiter;

    return await limiter(req, res, next);
  }
}
