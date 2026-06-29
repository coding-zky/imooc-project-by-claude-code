import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: bigint): Promise<{
        username: string;
        email: string | null;
        id: bigint;
        avatar: string | null;
        status: number;
        createdAt: Date;
    } | null>;
}
