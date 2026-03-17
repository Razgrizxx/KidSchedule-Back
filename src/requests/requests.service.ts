import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import {
  CreateChangeRequestDto,
  RespondChangeRequestDto,
} from './dto/change-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
  ) {}

  async create(
    familyId: string,
    requesterId: string,
    dto: CreateChangeRequestDto,
  ) {
    await this.familyService.assertMember(familyId, requesterId);

    return this.prisma.changeRequest.create({
      data: {
        familyId,
        requesterId,
        type: dto.type,
        originalDate: new Date(dto.originalDate),
        requestedDate: new Date(dto.requestedDate),
        childId: dto.childId,
        reason: dto.reason,
      },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);

    return this.prisma.changeRequest.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        responder: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async respond(
    familyId: string,
    requestId: string,
    responderId: string,
    dto: RespondChangeRequestDto,
  ) {
    await this.familyService.assertMember(familyId, responderId);

    const request = await this.prisma.changeRequest.findFirst({
      where: { id: requestId, familyId },
    });

    if (!request) throw new NotFoundException('Change request not found');
    if (request.status !== 'PENDING')
      throw new BadRequestException('Request already resolved');
    if (request.requesterId === responderId) {
      throw new ForbiddenException('Cannot respond to your own request');
    }

    if (dto.action === 'COUNTER_PROPOSED' && !dto.counterDate) {
      throw new BadRequestException(
        'counterDate is required for counter proposals',
      );
    }

    return this.prisma.changeRequest.update({
      where: { id: requestId },
      data: {
        status: dto.action,
        responderId,
        counterDate: dto.counterDate ? new Date(dto.counterDate) : undefined,
        counterReason: dto.counterReason,
        resolvedAt: dto.action !== 'COUNTER_PROPOSED' ? new Date() : undefined,
      },
    });
  }
}
