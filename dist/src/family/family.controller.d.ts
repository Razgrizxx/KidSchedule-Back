import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class FamilyController {
    private familyService;
    constructor(familyService: FamilyService);
    create(user: AuthUser, dto: CreateFamilyDto): Promise<{
        members: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            joinedAt: Date;
            familyId: string;
            userId: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(user: AuthUser): Promise<({
        children: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            dateOfBirth: Date;
            color: string;
        }[];
        members: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            joinedAt: Date;
            familyId: string;
            userId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(user: AuthUser, id: string): Promise<({
        children: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            familyId: string;
            dateOfBirth: Date;
            color: string;
        }[];
        members: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            joinedAt: Date;
            familyId: string;
            userId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    invite(user: AuthUser, familyId: string, dto: InviteMemberDto): Promise<{
        message: string;
        token: string;
    }>;
    verifyInvitation(token: string): Promise<{
        familyId: string;
        familyName: string;
        inviterName: string;
        email: string;
    }>;
    acceptInvitation(user: AuthUser, token: string): Promise<{
        message: string;
        familyId: string;
    }>;
}
