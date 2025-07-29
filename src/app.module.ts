import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { initializeDatabase } from './common/utilis/database.utils';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerOptions } from './config/mailer.config';
import { JwtModule } from '@nestjs/jwt';
import { SocketModule } from './socket/socket.module';
import { FirebaseModule } from './firebase/firebase.module';
import { LanguagesModule } from './languages/languages.module';
import { JWTService } from './common/services/jwt.service';
import { RedisService } from './common/services/redis.service';
import { UuidService } from './common/services/uuid.service';
import { BackupService } from './common/services/backup.service';
import { RateLimitMiddleware } from './common/middlewares/rate-limit.middleware';
import { HelmetMiddleware } from './common/middlewares/helmet.middleware';
import { CorsMiddleware } from './common/middlewares/cors.middleware';
import { WafMiddleware } from './common/middlewares/waf.middleware';
import { serialCheckMiddleware } from './common/middlewares/serial_check.middleware';
import { authenticationMiddleware } from './common/middlewares/authentication.middleware';
import { UserModule } from './user/user.module';
import { BlockModule } from './block/block.module';
import { AuthModule } from './auth/auth.module';
import { UserRefreshToken } from './user/entities/user_refresh_token.entity';
import { UserDevice } from './user/entities/user_device.entity';
import { DefaultDataModule } from './default_data/default_data.module';
import { ProfileModule } from './profile/profile.module';
import { Error } from './error/entities/error.entity';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './common/services/notifications.service';
import { NotificationsProcessor } from './common/processors/notifications.processor';
import { VersionsModule } from './versions/versions.module';
import { ErrorModule } from './error/error.module';
import { MediaModule } from './media/media.module';
import { EmptyTempsService } from './common/crons/delete_temps.crons';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Initialize the database if it doesn't exist
        await initializeDatabase(configService);
        return {
          dialect: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          logging: false,
          // timezone: '+03:00',
          // dialectOptions: {
          //   dateStrings: true,
          //   typeCast: true,
          // },
          synchronize: true,
          autoLoadModels: true,
        };
      },
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([UserRefreshToken, UserDevice, Error]),
    MailerModule.forRoot({ transport: MailerOptions }),
    JwtModule.register({ global: true }),
    SocketModule,
    FirebaseModule,
    LanguagesModule,
    UserModule,
    BlockModule,
    AuthModule,
    DefaultDataModule,
    ProfileModule,
    VersionsModule,
    ErrorModule,
    MediaModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JWTService,
    RedisService,
    UuidService,
    BackupService,
    EmptyTempsService,
    NotificationsService,
    NotificationsProcessor,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const excludedPaths = [
      { path: '/test', method: RequestMethod.GET },
      { path: '/auth/sign-in', method: RequestMethod.POST },
      { path: '/auth/sign-up', method: RequestMethod.POST },
      { path: '/auth/verification', method: RequestMethod.POST },
      { path: '/auth/send-code', method: RequestMethod.POST },
      { path: '/auth/refresh-token', method: RequestMethod.POST },
      { path: '/uploads/*path', method: RequestMethod.GET },
      { path: '/check-version', method: RequestMethod.GET },
      { path: '/init', method: RequestMethod.GET },
      { path: '/health', method: RequestMethod.GET },
      { path: '/metrics', method: RequestMethod.GET },
      { path: '/', method: RequestMethod.ALL },
    ];
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(HelmetMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(CorsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(WafMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(serialCheckMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(authenticationMiddleware)
      .exclude(...excludedPaths)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
