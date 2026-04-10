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
    remove(user: {
        id: string;
    }, familyId: string, id: string): Promise<void>;
}
