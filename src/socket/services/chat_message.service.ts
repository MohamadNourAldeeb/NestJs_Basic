import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { EVENTS } from 'src/common/constant/socket.event';
import * as path from 'path';

import { InjectConnection, InjectModel } from '@nestjs/sequelize';

import { User } from 'src/user/entities/user.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class chatMessageService {
  constructor(
    @InjectConnection() private sequelizeConnection: Sequelize,
    @InjectModel(User)
    private UserRepository: typeof User,
  ) {}

  async sendMessage(data: any, socket: Socket, server: Server) {
    let { main_message_id, room_name, content } = data;
    let socketHandshake: any = socket.handshake;

    let user_info: any = socket.handshake.headers.user;
    // let user_id = user_info.id;

    server
      .to(room_name.toString())
      .emit(EVENTS.message.emit.RECEIVE_MESSAGE, { message: content });
  }
}
