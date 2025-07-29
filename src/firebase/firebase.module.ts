import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import * as admin from 'firebase-admin';
import { fireBaseConfig } from 'src/config/firebase.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { User } from 'src/user/entities/user.entity';
@Module({
  controllers: [FirebaseController],
  providers: [FirebaseService],
  imports: [SequelizeModule.forFeature([UserDevice, User])],
})
export class FirebaseModule {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(fireBaseConfig),
    });
  }
}
