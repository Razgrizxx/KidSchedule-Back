import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { LocalStorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMomentDto } from './dto/moment.dto';
import { SubscriptionService } from '../stripe/subscription.service';
export declare class MomentsService {
    private prisma;
    private familyService;
    private storage;
    private subService;
    private notifications;
    constructor(prisma: PrismaService, familyService: FamilyService, storage: LocalStorageService, subService: SubscriptionService, notifications: NotificationsService);
    create(familyId: string, userId: string, dto: CreateMomentDto, file: Express.Multer.File): Promise<{
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string | null;
        caption: string | null;
        mediaUrl: string;
        cloudinaryPublicId: string | null;
        takenAt: Date | null;
        uploadedBy: string;
    }>;
    findAll(familyId: string, userId: string): Promise<({
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        familyId: string;
        childId: string | null;
        caption: string | null;
        mediaUrl: string;
        cloudinaryPublicId: string | null;
        takenAt: Date | null;
        uploadedBy: string;
    })[]>;
    remove(familyId: string, momentId: string, userId: string): Promise<{
        message: string;
    }>;
}
