import { Module } from '@nestjs/common';
import { DefaultDataService } from './default_data.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserSearch } from 'src/user/entities/user_searches.entity';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Role } from 'src/role/entities/role.entity';
import { Version } from 'src/versions/entities/version.entity';
import { UuidService } from 'src/common/services/uuid.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  providers: [DefaultDataService, UuidService],
  imports: [
    SequelizeModule.forFeature([
      UserSearch,
      UserRefreshToken,
      UserDevice,
      Language,
      Role,
      Version,
      User,
    ]),
  ],
})
export class DefaultDataModule {}
