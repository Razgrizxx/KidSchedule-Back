import { DocumentsService } from './documents.service';
import { DocumentCategory } from '@prisma/client';
export declare class DocumentsController {
    private readonly service;
    constructor(service: DocumentsService);
    upload(user: {
        id: string;
    }, familyId: string, file: Express.Multer.File, title: string, category: DocumentCategory, description?: string, childId?: string): Promise<{
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
    remove(user: {
        id: string;
    }, familyId: string, id: string): Promise<void>;
}
