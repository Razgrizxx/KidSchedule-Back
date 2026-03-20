"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const messaging_service_1 = require("./messaging.service");
let ChatGateway = class ChatGateway {
    jwtService;
    messagingService;
    server;
    constructor(jwtService, messagingService) {
        this.jwtService = jwtService;
        this.messagingService = messagingService;
    }
    handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ??
                client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (!token) {
                console.log('[WS] No token — disconnecting', client.id);
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            console.log('[WS] Connected:', client.id, '→ userId:', payload.sub);
        }
        catch (e) {
            console.log('[WS] Auth error — disconnecting', client.id, e);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const { userId, familyId } = client.data ?? {};
        console.log('[WS] Disconnected:', client.id, '→ userId:', userId);
        if (familyId && userId) {
            client.to(familyId).emit('user_stop_typing', { userId });
        }
    }
    handleJoinFamily(client, familyId) {
        client.join(familyId);
        client.data.familyId = familyId;
        const rooms = [...client.rooms].join(', ');
        console.log('[WS] join_family:', client.id, '→ room:', familyId, '| all rooms:', rooms);
        return { event: 'joined', familyId };
    }
    async handleSendMessage(client, dto) {
        const userId = client.data?.userId;
        if (!userId)
            return;
        const message = await this.messagingService.send(dto.familyId, userId, {
            content: dto.content,
        });
        this.server.to(dto.familyId).emit('new_message', message);
        return message;
    }
    handleTyping(client, familyId) {
        const { userId } = client.data ?? {};
        if (userId) {
            client.to(familyId).emit('user_typing', { userId });
        }
    }
    handleStopTyping(client, familyId) {
        const { userId } = client.data ?? {};
        if (userId) {
            client.to(familyId).emit('user_stop_typing', { userId });
        }
    }
    emitToFamily(familyId, event, data) {
        const roomSize = this.server?.sockets?.adapter?.rooms?.get(familyId)?.size ?? 0;
        console.log(`[WS] emitToFamily → room: ${familyId}, event: ${event}, sockets in room: ${roomSize}`);
        this.server?.to(familyId).emit(event, data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_family'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinFamily", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop_typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleStopTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        messaging_service_1.MessagingService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map