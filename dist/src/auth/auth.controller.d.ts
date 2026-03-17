import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendPhoneCodeDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import { AuthUser } from '../common/types/auth-user';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    sendCode(user: AuthUser, dto: SendPhoneCodeDto): Promise<{
        code?: string | undefined;
        message: string;
    }>;
    verifyPhone(user: AuthUser, dto: VerifyPhoneDto): Promise<{
        message: string;
    }>;
}
