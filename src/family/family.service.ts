import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private config: ConfigService,
  ) {}

  async create(userId: string, dto: CreateFamilyDto) {
    const family = await this.prisma.family.create({
      data: {
        name: dto.name,
        members: {
          create: { userId, role: UserRole.PARENT },
        },
      },
      include: { members: true },
    });
    return family;
  }

  async findAllForUser(userId: string) {
    return this.prisma.family.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        children: true,
      },
    });
  }

  async findOne(familyId: string, userId: string) {
    await this.assertMember(familyId, userId);
    return this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        children: true,
      },
    });
  }

  async inviteMember(familyId: string, inviterId: string, dto: InviteMemberDto) {
    await this.assertMember(familyId, inviterId);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation, family, inviter] = await Promise.all([
      this.prisma.familyInvitation.create({
        data: { familyId, invitedBy: inviterId, email: dto.email, expiresAt },
      }),
      this.prisma.family.findUnique({
        where: { id: familyId },
        include: { children: true },
      }),
      this.prisma.user.findUnique({ where: { id: inviterId } }),
    ]);

    if (family && inviter) {
      void this.mail.sendCoParentInvitation({
        toEmail: dto.email,
        inviterName: `${inviter.firstName} ${inviter.lastName}`,
        familyName: family.name,
        childrenNames: family.children.map((c) => c.firstName),
        token: invitation.token,
      });
    }

    return { message: 'Invitation sent', token: invitation.token };
  }

  async verifyInvitation(token: string) {
    const invitation = await this.prisma.familyInvitation.findUnique({
      where: { token },
      include: {
        family: true,
        inviter: { select: { firstName: true, lastName: true } },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING')
      throw new BadRequestException('Invitation already used');
    if (invitation.expiresAt < new Date())
      throw new BadRequestException('Invitation expired');

    return {
      familyId: invitation.familyId,
      familyName: invitation.family.name,
      inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
      email: invitation.email,
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.prisma.familyInvitation.findUnique({
      where: { token },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING')
      throw new BadRequestException('Invitation already used');
    if (invitation.expiresAt < new Date())
      throw new BadRequestException('Invitation expired');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.email !== invitation.email)
      throw new ForbiddenException('Email mismatch');

    await this.prisma.$transaction([
      this.prisma.familyInvitation.update({
        where: { token },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      }),
      this.prisma.familyMember.upsert({
        where: { familyId_userId: { familyId: invitation.familyId, userId } },
        create: {
          familyId: invitation.familyId,
          userId,
          role: UserRole.PARENT,
        },
        update: {},
      }),
    ]);

    return {
      message: 'Joined family successfully',
      familyId: invitation.familyId,
    };
  }

  async assertMember(familyId: string, userId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this family');
    return member;
  }
}
