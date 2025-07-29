import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/user/entities/user.entity';
import { Language } from 'src/languages/entities/language.entity';
import { ImageProcessingService } from 'src/common/services/image_processing.service';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { RedisService } from 'src/common/services/redis.service';
import { ProfileViewer } from './entities/profile.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Language,
      UserRefreshToken,
      ProfileViewer,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ImageProcessingService, RedisService],
})
export class ProfileModule {}
