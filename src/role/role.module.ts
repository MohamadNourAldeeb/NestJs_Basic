import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './entities/role.entity';
import { UuidService } from 'src/common/services/uuid.service';

@Module({
  imports: [SequelizeModule.forFeature([Role])],

  controllers: [RoleController],
  providers: [RoleService, UuidService],
})
export class RoleModule {}
//
