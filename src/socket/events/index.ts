import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { chatMessageEvents } from './chat_message.events';

@Injectable()
export class socketEvents {
  constructor(private readonly chatMessageEvent: chatMessageEvents) {}

  async index(socket: Socket, server: Server) {
    await this.chatMessageEvent.events(socket, server);
  }
}
