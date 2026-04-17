import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from '../storage/storage.service';
import { DocumentCategory } from '@prisma/client';
export declare class DocumentsService {
    private prisma;
    private storage;
    constructor(prisma: PrismaService, storage: LocalStorageService);
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
        category: import("@prisma/client").$Enums.DocumentCategory;
        title: string;
        description: string | null;
        fileUrl: string;
        cloudinaryPublicId: string;
        mimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        uploadedBy: string;
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
        category: import("@prisma/client").$Enums.DocumentCategory;
        title: string;
        description: string | null;
        fileUrl: string;
        cloudinaryPublicId: string;
        mimeType: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        childId: string | null;
        uploadedBy: string;
    })[]>;
    remove(familyId: string, id: string, userId: string): Promise<void>;
}
