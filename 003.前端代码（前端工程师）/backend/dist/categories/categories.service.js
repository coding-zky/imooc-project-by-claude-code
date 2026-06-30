"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const count = await this.prisma.expenseCategory.count();
        if (count === 0) {
            await this.seedCategories();
        }
    }
    async seedCategories() {
        const categories = [
            { name: '餐饮', emoji: '🍜', sortOrder: 1 },
            { name: '交通', emoji: '🚗', sortOrder: 2 },
            { name: '购物', emoji: '🛒', sortOrder: 3 },
            { name: '娱乐', emoji: '🎮', sortOrder: 4 },
            { name: '居住', emoji: '🏠', sortOrder: 5 },
            { name: '医疗', emoji: '💊', sortOrder: 6 },
            { name: '教育', emoji: '📚', sortOrder: 7 },
            { name: '通讯', emoji: '📱', sortOrder: 8 },
            { name: '社交', emoji: '🎁', sortOrder: 9 },
            { name: '其他', emoji: '📌', sortOrder: 10 },
        ];
        await this.prisma.expenseCategory.createMany({
            data: categories.map(c => ({
                ...c,
                isSystem: 1,
                status: 1,
            })),
        });
    }
    async findAll() {
        const categories = await this.prisma.expenseCategory.findMany({
            where: { status: 1 },
            orderBy: { sortOrder: 'asc' },
        });
        return categories.map(c => ({
            ...c,
            id: c.id.toString(),
        }));
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map