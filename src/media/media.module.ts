import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UuidService } from 'src/common/services/uuid.service';
import { Media } from './entities/media.entity';
import { ImageProcessingService } from 'src/common/services/image_processing.service';
import { RedisService } from 'src/common/services/redis.service';

@Module({
  imports: [SequelizeModule.forFeature([Media])],
  controllers: [MediaController],
  providers: [MediaService, UuidService, ImageProcessingService, RedisService],
})
export class MediaModule {}
