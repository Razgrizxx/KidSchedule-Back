import { PrismaService } from '../prisma/prisma.service';
import { FamilyService } from '../family/family.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMomentDto } from './dto/moment.dto';
import { SubscriptionService } from '../stripe/subscription.service';
export declare class MomentsService {
    private prisma;
    private familyService;
    private cloudinary;
    private subService;
    private notifications;
    constructor(prisma: PrismaService, familyService: FamilyService, cloudinary: CloudinaryService, subService: SubscriptionService, notifications: NotificationsService);
    create(familyId: string, userId: string, dto: CreateMomentDto, file: Express.Multer.File): Promise<{
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
    } & {
        id: string;
        caption: string | null;
        mediaUrl: string;
        cloudinaryPublicId: string | null;
        takenAt: Date | null;
        createdAt: Date;
        familyId: string;
        uploadedBy: string;
        childId: string | null;
    }>;
    findAll(familyId: string, userId: string): Promise<({
        uploader: {
            id: string;
            firstName: string;
            lastName: string;
        };
        child: {
            id: string;
            firstName: string;
            color: string;
        } | null;
    } & {
        id: string;
        caption: string | null;
        mediaUrl: string;
        cloudinaryPublicId: string | null;
        takenAt: Date | null;
        createdAt: Date;
        familyId: string;
        uploadedBy: string;
        childId: string | null;
    })[]>;
    remove(familyId: string, momentId: string, userId: string): Promise<{
        message: string;
    }>;
}
