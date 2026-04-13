import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DocumentCategory } from '@prisma/client';
export declare class DocumentsService {
    private prisma;
    private cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    upload(familyId: string, userId: string, file: Express.Multer.File, body: {
        title: string;
        category: DocumentCategory;
        description?: string;
        childId?: string;
    }): Promise<{
        uploader: {
            id: string;
            firstName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        title: string;
        description: string | null;
        category: import("@prisma/client").$Enums.DocumentCategory;
        cloudinaryPublicId: string;
        uploadedBy: string;
        fileUrl: string;
        mimeType: string | null;
    }>;
    findAll(familyId: string, childId?: string, category?: DocumentCategory): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        uploader: {
            id: string;
            firstName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        title: string;
        description: string | null;
        category: import("@prisma/client").$Enums.DocumentCategory;
        cloudinaryPublicId: string;
        uploadedBy: string;
        fileUrl: string;
        mimeType: string | null;
    })[]>;
    remove(familyId: string, id: string, userId: string): Promise<void>;
}
