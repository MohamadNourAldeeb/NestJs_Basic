import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Language } from './entities/language.entity';
import { User } from 'src/user/entities/user.entity';
import { UuidService } from 'src/common/services/uuid.service';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, UuidService],
  imports: [SequelizeModule.forFeature([Language, User])],
})
export class LanguagesModule {}
