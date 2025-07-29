import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import easyWaf from 'easy-waf';
import { RedisService } from '../services/redis.service';

@Injectable()
export class WafMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const forwardedIp = req.headers['x-forwarded-for'] || req.ip;
      const redisServices = new RedisService();
      let blockIps: any[] = [];
      let ipBlocked: string | null = await redisServices.getFromRedisCache(
        `ipBlock:${forwardedIp}`,
      );
      if (ipBlocked) {
        if (!Array.isArray(forwardedIp)) {
          blockIps.push(forwardedIp);
        } else {
          blockIps.push(forwardedIp[0]);
        }
      }

      const defaultOptions: any = {
        dryMode: false,
        ipBlacklist: blockIps,
        ipWhitelist: [],
        modules: {
          directoryTraversal: {
            enabled: false,
            // //for example
            // excludePaths: /^\/customer\/home\/.*$/i,
          },
          xss: {
            enabled: true,
            // //for example
            excludePaths: /^\/terms$/,
          },
          sqlInjection: { enabled: true },
          commandInjection: { enabled: true },
          fileUpload: { enabled: true },
        },
        postBlockHook: (req: any, moduleName: string, ip: string) => {
          try {
            const moreData = {
              visitedPath: req.originalUrl,
              method: req.method,
              bodySize: JSON.stringify(req.body)?.length,
              querySize: JSON.stringify(req.query)?.length,
              Body: req.body,
              Query: req.query,
              Params: req.params,
              path: req.path,
            };
            // Notify developers via email
            // WafErrorsToDevelopers({
            //     ip: forwardedIp,
            //     moduleName,
            //     url: req.url,
            //     method: req.method,
            //     query: req.query,
            //     body: req.body,
            //     headers: req.headers,
            // });
          } catch (error) {
            console.error('Error in postBlockHook:', error);
          }
        },
      };

      await easyWaf(defaultOptions)(req, res, next);
    } catch (error) {
      console.error('Error in WafMiddleware:', error);
      next(error);
    }
  }
}
