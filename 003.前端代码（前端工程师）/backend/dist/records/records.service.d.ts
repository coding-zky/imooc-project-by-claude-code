import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto, UpdateRecordDto, QueryRecordsDto } from './dto/records.dto';
export declare class RecordsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: bigint, dto: CreateRecordDto): Promise<any>;
    findAll(userId: bigint, query: QueryRecordsDto): Promise<{
        records: any[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(userId: bigint, id: string): Promise<any>;
    update(userId: bigint, id: string, dto: UpdateRecordDto): Promise<any>;
    remove(userId: bigint, id: string): Promise<{
        success: boolean;
    }>;
}
