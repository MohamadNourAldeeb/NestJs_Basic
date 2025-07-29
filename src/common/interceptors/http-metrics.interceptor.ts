import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private static httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  private static httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const route = request.route?.path || 'unknown';

    const start = process.hrtime();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const status = data?.statusCode || 500;
          const [seconds, nanoseconds] = process.hrtime(start);
          const durationInSeconds = seconds + nanoseconds / 1e9;

          HttpMetricsInterceptor.httpRequestsTotal.inc({
            method,
            route,
            status,
          });
          HttpMetricsInterceptor.httpRequestDuration.observe(
            { method, route },
            durationInSeconds,
          );
        },
        error: (err) => {
          const status = err.status || 500;
          const [seconds, nanoseconds] = process.hrtime(start);
          const durationInSeconds = seconds + nanoseconds / 1e9;

          HttpMetricsInterceptor.httpRequestsTotal.inc({
            method,
            route,
            status,
          });
          HttpMetricsInterceptor.httpRequestDuration.observe(
            { method, route },
            durationInSeconds,
          );
        },
      }),
    );
  }
}
