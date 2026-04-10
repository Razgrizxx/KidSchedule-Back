import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto';

@Injectable()
export class EmergencyContactsService {
  constructor(private prisma: PrismaService) {}

  async create(familyId: string, userId: string, dto: CreateEmergencyContactDto) {
    return this.prisma.emergencyContact.create({
      data: {
        familyId,
        createdBy: userId,
        childId: dto.childId,
        role: dto.role,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        notes: dto.notes,
        isPrimary: dto.isPrimary ?? false,
      },
      include: { createdByUser: { select: { id: true, firstName: true } } },
    });
  }

  async findAll(familyId: string, childId?: string) {
    return this.prisma.emergencyContact.findMany({
      where: {
        familyId,
        ...(childId && { childId }),
      },
      include: { createdByUser: { select: { id: true, firstName: true } } },
      orderBy: [{ childId: 'asc' }, { isPrimary: 'desc' }, { role: 'asc' }],
    });
  }

  async update(familyId: string, id: string, userId: string, dto: UpdateEmergencyContactDto) {
    const contact = await this.prisma.emergencyContact.findFirst({ where: { id, familyId } });
    if (!contact) throw new NotFoundException('Contact not found');
    // Any family member can edit
    return this.prisma.emergencyContact.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      },
      include: { createdByUser: { select: { id: true, firstName: true } } },
    });
  }

  async remove(familyId: string, id: string, userId: string) {
    const contact = await this.prisma.emergencyContact.findFirst({ where: { id, familyId } });
    if (!contact) throw new NotFoundException('Contact not found');
    if (contact.createdBy !== userId) throw new ForbiddenException('Only the creator can delete');
    await this.prisma.emergencyContact.delete({ where: { id } });
  }
}
