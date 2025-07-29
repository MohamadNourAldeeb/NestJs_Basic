import { Module } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Version } from './entities/version.entity';
import { RedisService } from 'src/common/services/redis.service';
import { UuidService } from 'src/common/services/uuid.service';
import { ActivityLog } from 'src/user/entities/activity_log.entity';

@Module({
  imports: [SequelizeModule.forFeature([Version, ActivityLog])],
  controllers: [VersionsController],
  providers: [VersionsService, RedisService, UuidService],
})
export class VersionsModule {}
