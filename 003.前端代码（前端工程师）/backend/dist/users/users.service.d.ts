import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto, BindPhoneDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: bigint): Promise<{
        id: number;
        username: string;
        email: string | null;
        avatar: string | null;
        status: number;
        createdAt: Date;
    }>;
    updateProfile(userId: bigint, dto: UpdateProfileDto): Promise<{
        id: number;
        username: string;
        email: string | null;
        avatar: string | null;
        status: number;
        createdAt: Date;
    }>;
    changePassword(userId: bigint, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    bindPhone(userId: bigint, dto: BindPhoneDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getPreferences(userId: bigint): Promise<{
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
    updatePreferences(userId: bigint, dto: any): Promise<{
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
