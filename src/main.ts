import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/constant/http-exception-filter';
import * as path from 'path';
import * as useragent from 'express-useragent';
import * as express from 'express';
import * as compression from 'compression';
import { loadGeoIPDatabase, welcomeLog } from './common/utilis/helper';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpMetricsInterceptor } from './common/interceptors/http-metrics.interceptor';
import { Queue } from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
dotenv.config();

// import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
// import { readFileSync } from 'fs';

async function bootstrap() {
  // // this for run https by code !!

  // const httpsOptions: HttpsOptions = {
  //   key: readFileSync(join(path.resolve(), 'src', 'certs', 'privateKey.pem')),
  //   cert: readFileSync(join(path.resolve(), 'src', 'certs', 'certificate.pem')),
  // };
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: false,
    // httpsOptions,
  });

  const config = new DocumentBuilder()
    .setTitle('Basic nestjs Project Code')
    .setDescription('API description for Nestjs basic code')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.use(compression({ encodings: ['gzip', 'deflate'] }));
  app.use(useragent.express());

  let uploadsPath = join(path.resolve(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  let appsPath = join(path.resolve(), 'apps');
  app.useStaticAssets(appsPath, {
    prefix: '/apps',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // -----------------------------------------------
      // this for changing HttpStatusCode returned
      errorHttpStatusCode: 422,
      // -----------------------------------------------
      // this for stop ErrorMessages returned
      // disableErrorMessages: true,
      // -----------------------------------------------
      // for make custom message
      // dismissDefaultMessages: true,
      // -----------------------------------------------
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false, // Disable implicit conversion
      },
    }),
  );

  let io = new IoAdapter(app);
  app.useWebSocketAdapter(io);
  const adminUiPath = join('./node_modules/@socket.io/admin-ui/ui/dist');
  app.use(express.static('assets'));

  // Serve Socket.IO client
  app.use(
    '/socket.io',
    express.static(join(path.resolve(), './node_modules/socket.io/dist')),
  );
  app.use('/sockets', express.static(adminUiPath));

  const queue = app.get<Queue>('BullQueue_notifications');
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullAdapter(queue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new HttpMetricsInterceptor());
  // to get the country of ip
  // ___________________________
  await loadGeoIPDatabase();
  // ___________________________
  app.listen(process.env.PORT, () => {
    welcomeLog(process.env.PORT);
  });
}
bootstrap();
