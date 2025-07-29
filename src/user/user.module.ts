import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UserRefreshToken } from './entities/user_refresh_token.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from '../permission/entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { UserPermission } from './entities/user_permission.entity';
import { RolePermission } from '../role/entities/roles_permissions.entity';

import { ActivityLog } from './entities/activity_log.entity';
import { ValidationDtoService } from 'src/common/services/validations.service';
import { Language } from 'src/languages/entities/language.entity';
import { UuidService } from 'src/common/services/uuid.service';
import { MailService } from 'src/mailer/mailer.service';
import { RedisService } from 'src/common/services/redis.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserRefreshToken,
      Permission,
      Role,
      UserPermission,
      RolePermission,
      ActivityLog,
      Language,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    ValidationDtoService,
    UuidService,
    MailService,
    RedisService,
  ],
})
export class UserModule {}
