export declare class CreateRecordDto {
    amount: number;
    categoryId: string;
    recordDate: string;
    note?: string;
}
export declare class UpdateRecordDto {
    amount?: number;
    categoryId?: string;
    recordDate?: string;
    note?: string;
}
export declare class QueryRecordsDto {
    month?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
