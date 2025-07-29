import { Injectable, Response, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { AuthSocketService } from './services/auth_socket.service';
import { socketEvents } from 'src/socket/events/index';
@Injectable()
export class socketService {
  constructor(
    private readonly authenticationSocket: AuthSocketService,
    private readonly socketEventHandel: socketEvents,
  ) {}

  async handleConnection(socket: Socket, server: Server) {
    const userInfo: any = socket.handshake.headers.user;
    global.supporters = {};
    global.users = {};

    if (userInfo.role_id != 2 && userInfo.role_id != 1)
      global.supporters[userInfo.id] = {
        socket,
        room: null,
        user_info: userInfo,
        state: 'online',
        my_rooms: [],
      };
    else
      global.users[userInfo.id] = {
        socket,
        room: null,
        user_info: userInfo,
        state: 'online',
        my_rooms: [],
      };
    this.socketEventHandel.index(socket, server);

    socket.on('disconnect', () => {
      socket.disconnect();
      if (userInfo.role_id != 2 && userInfo.role_id != 1)
        delete global.supporters[userInfo.id];
      else delete global.users[userInfo.id];
    });
  }
}
