import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';
import { JWTService } from 'src/common/services/jwt.service';
import { RedisService } from 'src/common/services/redis.service';
import { UuidService } from 'src/common/services/uuid.service';
import { EncryptionService } from 'src/common/services/encrypt.service';
import { Role } from 'src/role/entities/role.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { RolePermission } from 'src/role/entities/roles_permissions.entity';
import { UserPermission } from 'src/user/entities/user_permission.entity';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { MailService } from 'src/mailer/mailer.service';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { Version } from 'src/versions/entities/version.entity';
import { UserLog } from 'src/user/entities/user_log.entity';
import { Language } from 'src/languages/entities/language.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserRefreshToken,
      UserDevice,
      UserPermission,
      UserLog,
      RolePermission,
      Permission,
      Role,
      Version,
      Language,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTService,
    RedisService,
    UuidService,
    EncryptionService,
    MailService,
    UuidService,
  ],
})
export class AuthModule {}
