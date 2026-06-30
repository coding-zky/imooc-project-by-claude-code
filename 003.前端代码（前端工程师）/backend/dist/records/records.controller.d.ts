import { RecordsService } from './records.service';
import { CreateRecordDto, UpdateRecordDto, QueryRecordsDto } from './dto/records.dto';
export declare class RecordsController {
    private readonly recordsService;
    constructor(recordsService: RecordsService);
    create(req: any, dto: CreateRecordDto): Promise<any>;
    findAll(req: any, query: QueryRecordsDto): Promise<{
        records: any[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<any>;
    update(req: any, id: string, dto: UpdateRecordDto): Promise<any>;
    remove(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
