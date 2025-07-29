import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
const CorsConfig = {
  development: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Access-Token',
      'X-Key',
      'X-Requested-With',
      'accept-language',
      'Origin',
      'device-serial',
      'api-key',
      'api_key',
    ],
    credentials: true,
  },
  production: {
    // for web
    // origin: process.env.CLIENT_URL,
    // for apk
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Access-Token',
      'X-Key',
      'X-Requested-With',
      'accept-language',
      'Origin',
      'device-serial',
      'api-key',
      'api_key',
    ],
    credentials: true,
  },
};

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const env = process.env.NODE_ENV || 'development';
    let corsOptions = CorsConfig[env];

    cors(corsOptions)(req, res, next);
  }
}
