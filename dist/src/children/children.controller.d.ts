import { ChildrenService } from './children.service';
import { CreateChildDto, UpdateChildDto } from './dto/child.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class ChildrenController {
    private childrenService;
    constructor(childrenService: ChildrenService);
    create(user: AuthUser, familyId: string, dto: CreateChildDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }>;
    findAll(user: AuthUser, familyId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }[]>;
    findOne(user: AuthUser, familyId: string, childId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }>;
    update(user: AuthUser, familyId: string, childId: string, dto: UpdateChildDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        dateOfBirth: Date;
        color: string;
    }>;
    remove(user: AuthUser, familyId: string, childId: string): Promise<{
        message: string;
    }>;
}
