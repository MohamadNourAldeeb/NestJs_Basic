import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { socketService } from './socket.service';
import { instrument } from '@socket.io/admin-ui';
import { AuthSocketService } from './services/auth_socket.service';

@WebSocketGateway({
  pingInterval: 30000,
  pingTimeout: 5000,
  cors: {
    origin: ['bgb'],
    credentials: true,
  },
})
// @UseFilters(WebsocketExceptionsFilter)
// @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SocketGateway implements OnGatewayConnection {
  constructor(
    private readonly socketService: socketService,
    private readonly authenticationSocket: AuthSocketService,
  ) {}

  @WebSocketServer()
  private server: Server;
  afterInit() {
    instrument(this.server, {
      auth: {
        type: 'basic',
        username: 'admin',
        password:
          '$2a$12$y2rLI5avCgsZ5UpMp2Hc8O32qc/VsrhLS310UkyCpmxDQOlP2arsi', // "changeit" encrypted with bcrypt
      },
      mode: 'development',
    });
    // ! Middleware to check authentication
    this.server.use(this.authenticationSocket.authentication);
  }

  async handleConnection(client: Socket): Promise<any> {
    console.log('user has connected successfully , Socket Id =' + client.id);
    this.socketService.handleConnection(client, this.server);
  }

  handleDisconnect(client: Socket): void {
    client.disconnect(true);
    console.log('user disconnect', client.id);
  }
}
