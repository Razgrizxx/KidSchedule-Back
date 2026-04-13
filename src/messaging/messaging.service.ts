import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
    private notifications: NotificationsService,
  ) {}

  async send(familyId: string, senderId: string, dto: SendMessageDto) {
    await this.familyService.assertMember(familyId, senderId);

    // Get last message for hash chain
    const lastMessage = await this.prisma.message.findFirst({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      select: { contentHash: true },
    });

    const previousHash = lastMessage?.contentHash ?? '0';
    const timestamp = new Date().toISOString();
    const contentHash = createHash('sha256')
      .update(`${dto.content}${timestamp}${previousHash}`)
      .digest('hex');

    const message = await this.prisma.message.create({
      data: {
        familyId,
        senderId,
        content: dto.content,
        attachmentUrl: dto.attachmentUrl,
        contentHash,
        previousHash,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Push notification to the other family members (fire-and-forget)
    const senderName = message.sender
      ? `${message.sender.firstName} ${message.sender.lastName}`
      : 'Nuevo mensaje';
    const preview = dto.content.length > 80
      ? dto.content.slice(0, 80) + '…'
      : dto.content;
    void this.notifications.sendToFamily(familyId, senderId, {
      title: senderName,
      body: preview,
      data: { type: 'MESSAGE', familyId },
    }).catch(() => {});

    return message;
  }

  async findAll(familyId: string, userId: string, cursor?: string, take = 50) {
    await this.familyService.assertMember(familyId, userId);

    const messages = await this.prisma.message.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === take ? messages[0].id : null,
    };
  }

  async verifyChain(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    const messages = await this.prisma.message.findMany({
      where: { familyId },
      orderBy: { createdAt: 'asc' },
    });

    let isValid = true;
    const violations: string[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const expectedPrevHash = i === 0 ? '0' : messages[i - 1].contentHash;

      if (msg.previousHash !== expectedPrevHash) {
        isValid = false;
        violations.push(`Message ${msg.id} has broken chain link`);
      }
    }

    return { isValid, totalMessages: messages.length, violations };
  }

  /** Emit an immutable audit log entry (system message). */
  async sendSystemMessage(familyId: string, content: string) {
    const lastMessage = await this.prisma.message.findFirst({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      select: { contentHash: true },
    });

    const previousHash = lastMessage?.contentHash ?? '0';
    const timestamp = new Date().toISOString();
    const contentHash = createHash('sha256')
      .update(`${content}${timestamp}${previousHash}`)
      .digest('hex');

    // System messages are sent on behalf of the first family member
    const member = await this.prisma.familyMember.findFirst({
      where: { familyId },
    });
    if (!member) return;

    return this.prisma.message.create({
      data: {
        familyId,
        senderId: member.userId,
        content,
        contentHash,
        previousHash,
        isSystemMessage: true,
        status: 'DELIVERED',
      },
    });
  }

  async markRead(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    await this.prisma.message.updateMany({
      where: {
        familyId,
        senderId: { not: userId },
        status: { not: 'READ' },
      },
      data: { status: 'READ' },
    });
    return { message: 'Messages marked as read' };
  }
}
