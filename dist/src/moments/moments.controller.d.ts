import { MomentsService } from './moments.service';
import { CreateMomentDto } from './dto/moment.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class MomentsController {
    private momentsService;
    constructor(momentsService: MomentsService);
    create(user: AuthUser, familyId: string, dto: CreateMomentDto, file: Express.Multer.File): Promise<{
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
    findAll(user: AuthUser, familyId: string): Promise<({
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
    remove(user: AuthUser, familyId: string, momentId: string): Promise<{
        message: string;
    }>;
}
