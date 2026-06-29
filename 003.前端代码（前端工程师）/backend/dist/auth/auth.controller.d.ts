import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: number;
            username: string;
            email: string | null;
            avatar: string | null;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: number;
            username: string;
            email: string | null;
            avatar: string | null;
        };
        token: string;
    }>;
}
