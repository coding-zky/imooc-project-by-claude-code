import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        username: string;
        email: string | null;
        id: bigint;
        avatar: string | null;
        status: number;
        createdAt: Date;
    } | null>;
}
