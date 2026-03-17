import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendPhoneCodeDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import type { AuthUser } from '../common/types/auth-user';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    sendCode(user: AuthUser, dto: SendPhoneCodeDto): Promise<{
        code?: string | undefined;
        message: string;
    }>;
    verifyPhone(user: AuthUser, dto: VerifyPhoneDto): Promise<{
        message: string;
    }>;
}
