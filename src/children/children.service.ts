import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';

@Injectable()
export class ChildrenService {
  constructor(
    private prisma: PrismaService,
    private familyService: FamilyService,
  ) {}

  async create(familyId: string, userId: string, dto: CreateChildDto) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.child.create({
      data: { ...dto, familyId, dateOfBirth: new Date(dto.dateOfBirth) },
    });
  }

  async findAll(familyId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    return this.prisma.child.findMany({
      where: { familyId },
      orderBy: { firstName: 'asc' },
    });
  }

  async findOne(familyId: string, childId: string, userId: string) {
    await this.familyService.assertMember(familyId, userId);
    const child = await this.prisma.child.findFirst({
      where: { id: childId, familyId },
    });
    if (!child) throw new NotFoundException('Child not found');
    return child;
  }

  async update(
    familyId: string,
    childId: string,
    userId: string,
    dto: UpdateChildDto,
  ) {
    await this.findOne(familyId, childId, userId);
    return this.prisma.child.update({
      where: { id: childId },
      data: {
        ...dto,
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      },
    });
  }

  async remove(familyId: string, childId: string, userId: string) {
    await this.findOne(familyId, childId, userId);
    await this.prisma.child.delete({ where: { id: childId } });
    return { message: 'Child deleted' };
  }
}
