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
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const serialize = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'bigint')
        return Number(obj);
    if (obj instanceof library_1.Decimal)
        return Number(obj.toString());
    if (obj instanceof Date)
        return obj.toISOString();
    if (Array.isArray(obj))
        return obj.map(serialize);
    if (typeof obj === 'object') {
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = serialize(obj[key]);
        }
        return result;
    }
    return obj;
};
let RecordsService = class RecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const category = await this.prisma.expenseCategory.findUnique({
            where: { id: BigInt(dto.categoryId) },
        });
        if (!category) {
            throw new common_1.NotFoundException('消费分类不存在');
        }
        const id = crypto.randomUUID();
        const record = await this.prisma.expenseRecord.create({
            data: {
                id,
                userId,
                categoryId: BigInt(dto.categoryId),
                amount: dto.amount,
                recordDate: new Date(dto.recordDate),
                note: dto.note || '',
            },
            include: {
                category: true,
            },
        });
        return serialize(record);
    }
    async findAll(userId, query) {
        const { month, categoryId, startDate, endDate, page = 1, pageSize = 20, sortBy = 'recordDate', sortOrder = 'desc' } = query;
        const where = {
            userId,
            status: 1,
        };
        if (month) {
            const [year, m] = month.split('-');
            const startDate = new Date(Date.UTC(parseInt(year), parseInt(m) - 1, 1, 0, 0, 0, 0));
            const endDate = new Date(Date.UTC(parseInt(year), parseInt(m), 0, 23, 59, 59, 999));
            where.recordDate = {
                gte: startDate,
                lte: endDate,
            };
        }
        if (categoryId) {
            where.categoryId = BigInt(categoryId);
        }
        if (startDate) {
            where.recordDate = {
                ...where.recordDate,
                gte: new Date(startDate),
            };
        }
        if (endDate) {
            where.recordDate = {
                ...where.recordDate,
                lte: new Date(endDate),
            };
        }
        const [records, total] = await Promise.all([
            this.prisma.expenseRecord.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.expenseRecord.count({ where }),
        ]);
        return {
            records: records.map(r => serialize(r)),
            pagination: {
                page,
                pageSize,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / pageSize),
            },
        };
    }
    async findOne(userId, id) {
        const record = await this.prisma.expenseRecord.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!record) {
            throw new common_1.NotFoundException('记录不存在');
        }
        if (record.userId !== userId) {
            throw new common_1.ForbiddenException('无权访问此记录');
        }
        return serialize(record);
    }
    async update(userId, id, dto) {
        const record = await this.prisma.expenseRecord.findUnique({
            where: { id },
        });
        if (!record) {
            throw new common_1.NotFoundException('记录不存在');
        }
        if (record.userId !== userId) {
            throw new common_1.ForbiddenException('无权修改此记录');
        }
        const updateData = {};
        if (dto.amount !== undefined)
            updateData.amount = dto.amount;
        if (dto.categoryId !== undefined)
            updateData.categoryId = BigInt(dto.categoryId);
        if (dto.recordDate !== undefined)
            updateData.recordDate = new Date(dto.recordDate);
        if (dto.note !== undefined)
            updateData.note = dto.note;
        const updated = await this.prisma.expenseRecord.update({
            where: { id },
            data: updateData,
            include: { category: true },
        });
        return serialize(updated);
    }
    async remove(userId, id) {
        const record = await this.prisma.expenseRecord.findUnique({
            where: { id },
        });
        if (!record) {
            throw new common_1.NotFoundException('记录不存在');
        }
        if (record.userId !== userId) {
            throw new common_1.ForbiddenException('无权删除此记录');
        }
        await this.prisma.expenseRecord.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordsService);
//# sourceMappingURL=records.service.js.map