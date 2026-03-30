import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private mail;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, mail: MailService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            isVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone: string | null;
            isVerified: boolean;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private getVonageClient;
    private normalizePhone;
    sendPhoneCode(userId: string, phone: string): Promise<{
        code?: string | undefined;
        message: string;
    }>;
    verifyPhone(userId: string, phone: string, code: string): Promise<{
        message: string;
    }>;
    private signToken;
}
