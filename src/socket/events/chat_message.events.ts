import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { EVENTS } from 'src/common/constant/socket.event';
import { tryCatch } from 'src/common/constant/http-exception-filter';
import { chatMessageService } from 'src/socket/services/chat_message.service';

@Injectable()
export class chatMessageEvents {
  constructor(private readonly chatMessage: chatMessageService) {}

  async events(socket: Socket, server: Server) {
    socket.on(
      EVENTS.message.listen.SEND_MESSAGE,
      tryCatch(socket, server, async (data: any) => {
        return await this.chatMessage.sendMessage(data, socket, server);
      }),
    );
  }
}
