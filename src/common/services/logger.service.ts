import { Injectable } from '@nestjs/common';
import { logger } from '../../config/winston.config';
import { Request } from 'express';

@Injectable()
export class LoggerService {
  log(data: any, context?: string, req?: Request) {
    const headers = { ...req?.headers };
    delete headers.authorization;
    const meta = {
      ip: req?.ip,
      file: __filename,
      url: req?.url,
      base_url: req?.baseUrl,
      timestamp: new Date().toISOString(),
      headers,
      statusCode: req?.statusCode,
      method: req?.method,
      params: req?.params,
      query: req?.query,
      route: req?.route?.path,
      secure: req?.secure,
      statusMessage: req?.statusMessage,
      useragent: req?.headers['user-agent'],
      context,
    };

    // تسجيل الرسالة مع الـ meta
    logger.info(JSON.stringify(data), meta);
  }

  error(message: string[], status: number, context?: any) {
    logger.log('error', {
      status,
      message,
      file_after_deploy: __filename,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  warn(message: string, context?: string) {
    logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    logger.debug(message, { context });
  }
}
