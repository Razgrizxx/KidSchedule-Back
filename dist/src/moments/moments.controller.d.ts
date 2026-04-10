import { MomentsService } from './moments.service';
import { CreateMomentDto } from './dto/moment.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class MomentsController {
    private momentsService;
    constructor(momentsService: MomentsService);
    create(user: AuthUser, familyId: string, dto: CreateMomentDto, file: Express.Multer.File): Promise<{
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
    findAll(user: AuthUser, familyId: string): Promise<({
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
    remove(user: AuthUser, familyId: string, momentId: string): Promise<{
        message: string;
    }>;
}
