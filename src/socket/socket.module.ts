import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { socketService } from './socket.service';
import { ConfigModule } from '@nestjs/config';
import { AuthSocketService } from './services/auth_socket.service';
import { User } from 'src/user/entities/user.entity';
import { RolePermission } from 'src/role/entities/roles_permissions.entity';
import { UserPermission } from 'src/user/entities/user_permission.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { socketEvents } from 'src/socket/events/index';
import { chatMessageEvents } from 'src/socket/events/chat_message.events';
import { chatMessageService } from './services/chat_message.service';
import { RedisService } from 'src/common/services/redis.service';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { JWTService } from 'src/common/services/jwt.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forFeature([
      User,
      UserRefreshToken,
      RolePermission,
      UserPermission,
    ]),
  ],
  providers: [
    SocketGateway,
    socketService,
    AuthSocketService,
    JWTService,
    socketEvents,
    socketService,
    chatMessageService,
    chatMessageEvents,
    RedisService,
  ],
})
export class SocketModule {}
