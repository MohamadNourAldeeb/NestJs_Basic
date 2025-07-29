import { Module } from '@nestjs/common';
import { ErrorService } from './error.service';
import { ErrorController } from './error.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Error } from './entities/error.entity';

@Module({
  controllers: [ErrorController],
  providers: [ErrorService],
  imports: [SequelizeModule.forFeature([Error])],
})
export class ErrorModule {}
