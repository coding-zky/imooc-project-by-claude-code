import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
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
