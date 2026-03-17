import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
export declare class FamilyService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateFamilyDto): Promise<{
        members: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            userId: string;
            joinedAt: Date;
            familyId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    findAllForUser(userId: string): Promise<({
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
            userId: string;
            joinedAt: Date;
            familyId: string;
        })[];
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    })[]>;
    findOne(familyId: string, userId: string): Promise<({
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
            userId: string;
            joinedAt: Date;
            familyId: string;
        })[];
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }) | null>;
    inviteMember(familyId: string, inviterId: string, dto: InviteMemberDto): Promise<{
        message: string;
        token: string;
    }>;
    acceptInvitation(token: string, userId: string): Promise<{
        message: string;
        familyId: string;
    }>;
    assertMember(familyId: string, userId: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        userId: string;
        joinedAt: Date;
        familyId: string;
    }>;
}
