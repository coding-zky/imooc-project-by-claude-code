import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto, BindPhoneDto, UpdatePreferencesDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: number;
        username: string;
        email: string | null;
        avatar: string | null;
        status: number;
        createdAt: Date;
    }>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
        id: number;
        username: string;
        email: string | null;
        avatar: string | null;
        status: number;
        createdAt: Date;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    bindPhone(req: any, dto: BindPhoneDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getPreferences(req: any): Promise<{
        id: number;
        userId: number;
        pageSize: string;
        createdAt: Date;
        updatedAt: Date;
        defaultPage: string;
        reminderEnabled: number;
        reminderTime: Date | null;
        currency: string;
        language: string;
    }>;
    updatePreferences(req: any, dto: UpdatePreferencesDto): Promise<{
        id: number;
        userId: number;
        pageSize: string;
        createdAt: Date;
        updatedAt: Date;
        defaultPage: string;
        reminderEnabled: number;
        reminderTime: Date | null;
        currency: string;
        language: string;
    }>;
}
