import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(userId: bigint, days: number): Promise<{
        totalAmount: number;
        recordCount: number;
        avgDaily: number;
        dailyData: {
            date: string;
            amount: number;
            label: string;
        }[];
        categoryData: {
            categoryId: string;
            name: string;
            emoji: string;
            amount: number;
            percentage: number;
        }[];
    }>;
    exportExcel(userId: bigint, days: number): Promise<ExcelJS.Buffer>;
}
