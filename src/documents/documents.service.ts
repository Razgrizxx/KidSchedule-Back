import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from '../storage/storage.service';
import { DocumentCategory } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storage: LocalStorageService,
  ) {}

  async upload(
    familyId: string,
    userId: string,
    file: Express.Multer.File,
    body: {
      title: string;
      category: DocumentCategory;
      description?: string;
      childId?: string;
    },
  ) {
    const result = await this.storage.upload(
      file,
      `kidschedule/families/${familyId}/documents`,
      'raw',
    );

    return this.prisma.familyDocument.create({
      data: {
        familyId,
        uploadedBy: userId,
        childId: body.childId || null,
        category: body.category,
        title: body.title,
        description: body.description,
        fileUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        mimeType: file.mimetype,
      },
      include: { uploader: { select: { id: true, firstName: true } } },
    });
  }

  async findAll(familyId: string, childId?: string, category?: DocumentCategory) {
    return this.prisma.familyDocument.findMany({
      where: {
        familyId,
        ...(childId && { childId }),
        ...(category && { category }),
      },
      include: {
        uploader: { select: { id: true, firstName: true } },
        child: { select: { id: true, firstName: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(familyId: string, id: string, userId: string) {
    const doc = await this.prisma.familyDocument.findFirst({ where: { id, familyId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.uploadedBy !== userId) throw new ForbiddenException('Only the uploader can delete');

    await this.storage.delete(doc.cloudinaryPublicId);
    await this.prisma.familyDocument.delete({ where: { id } });
  }
}
