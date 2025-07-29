import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { UuidService } from 'src/common/services/uuid.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { RedisService } from 'src/common/services/redis.service';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { BlockList } from './entities/block.entity';

@Module({
  controllers: [BlockController],
  providers: [BlockService, UuidService, RedisService],
  imports: [
    SequelizeModule.forFeature([User, UserRefreshToken, UserDevice, BlockList]),
  ],
})
export class BlockModule {}
