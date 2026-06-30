import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private seedCategories;
    findAll(): Promise<{
        id: string;
        status: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sortOrder: number;
        nameEn: string | null;
        emoji: string;
        iconName: string | null;
        color: string | null;
        isSystem: number;
    }[]>;
}
