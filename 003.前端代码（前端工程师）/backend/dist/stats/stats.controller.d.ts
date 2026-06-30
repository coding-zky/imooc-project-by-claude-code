import type { Response } from 'express';
import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getStats(req: any, days: string): Promise<{
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
    exportExcel(req: any, days: string, res: Response): Promise<void>;
}
