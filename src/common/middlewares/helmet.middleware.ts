import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    helmet({
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      xssFilter: true,
      hidePoweredBy: true, // Disable X-Powered-By header
      noSniff: true, // Prevent MIME type sniffing
      frameguard: { action: 'deny' }, // Prevent clickjacking attacks
    })(req, res, next);
  }
}
