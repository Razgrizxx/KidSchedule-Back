import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private messagingService: MessagingService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        console.log('[WS] No token — disconnecting', client.id);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string; email: string }>(token);
      client.data.userId = payload.sub;
      console.log('[WS] Connected:', client.id, '→ userId:', payload.sub);
    } catch (e) {
      console.log('[WS] Auth error — disconnecting', client.id, e);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { userId, familyId } = client.data ?? {};
    console.log('[WS] Disconnected:', client.id, '→ userId:', userId);
    if (familyId && userId) {
      client.to(familyId).emit('user_stop_typing', { userId });
    }
  }

  @SubscribeMessage('join_family')
  handleJoinFamily(
    @ConnectedSocket() client: Socket,
    @MessageBody() familyId: string,
  ) {
    client.join(familyId);
    client.data.familyId = familyId;
    const rooms = [...client.rooms].join(', ');
    console.log('[WS] join_family:', client.id, '→ room:', familyId, '| all rooms:', rooms);
    return { event: 'joined', familyId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: { familyId: string; content: string },
  ) {
    const userId = client.data?.userId;
    if (!userId) return;

    const message = await this.messagingService.send(dto.familyId, userId, {
      content: dto.content,
    });

    // Emit to all members in the room (including sender)
    this.server.to(dto.familyId).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() familyId: string,
  ) {
    const { userId } = client.data ?? {};
    if (userId) {
      client.to(familyId).emit('user_typing', { userId });
    }
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() familyId: string,
  ) {
    const { userId } = client.data ?? {};
    if (userId) {
      client.to(familyId).emit('user_stop_typing', { userId });
    }
  }

  /** Broadcast an event to all sockets in a family room */
  emitToFamily(familyId: string, event: string, data: unknown) {
    const roomSize = this.server?.sockets?.adapter?.rooms?.get(familyId)?.size ?? 0;
    console.log(`[WS] emitToFamily → room: ${familyId}, event: ${event}, sockets in room: ${roomSize}`);
    this.server?.to(familyId).emit(event, data);
  }
}
