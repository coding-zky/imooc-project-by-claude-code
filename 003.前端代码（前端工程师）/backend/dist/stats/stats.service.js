"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(userId, days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        const records = await this.prisma.expenseRecord.findMany({
            where: {
                userId,
                status: 1,
                recordDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { category: true },
            orderBy: { recordDate: 'asc' },
        });
        const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
        const dailyMap = new Map();
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split('T')[0];
            dailyMap.set(key, 0);
        }
        records.forEach(r => {
            const key = new Date(r.recordDate).toISOString().split('T')[0];
            dailyMap.set(key, (dailyMap.get(key) || 0) + Number(r.amount));
        });
        const dailyData = Array.from(dailyMap.entries()).map(([date, amount]) => ({
            date,
            amount,
            label: date.slice(5),
        }));
        const categoryMap = new Map();
        records.forEach(r => {
            const key = r.categoryId.toString();
            const existing = categoryMap.get(key);
            if (existing) {
                existing.amount += Number(r.amount);
            }
            else {
                categoryMap.set(key, {
                    name: r.category.name,
                    emoji: r.category.emoji,
                    amount: Number(r.amount),
                });
            }
        });
        const categoryData = Array.from(categoryMap.entries())
            .map(([id, data]) => ({
            categoryId: id,
            name: data.name,
            emoji: data.emoji,
            amount: data.amount,
            percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 1000) / 10 : 0,
        }))
            .sort((a, b) => b.amount - a.amount);
        return {
            totalAmount,
            recordCount: records.length,
            avgDaily: days > 0 ? totalAmount / days : 0,
            dailyData,
            categoryData,
        };
    }
    async exportExcel(userId, days) {
        const stats = await this.getStats(userId, days);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'LightLedger';
        workbook.created = new Date();
        const summarySheet = workbook.addWorksheet('概览');
        summarySheet.columns = [
            { header: '指标', key: 'key', width: 20 },
            { header: '数值', key: 'value', width: 20 },
        ];
        summarySheet.addRow({ key: '统计周期', value: `最近${days}天` });
        summarySheet.addRow({ key: '总支出', value: `¥ ${stats.totalAmount.toFixed(2)}` });
        summarySheet.addRow({ key: '日均消费', value: `¥ ${stats.avgDaily.toFixed(2)}` });
        summarySheet.addRow({ key: '记录笔数', value: stats.recordCount });
        const dailySheet = workbook.addWorksheet('每日趋势');
        dailySheet.columns = [
            { header: '日期', key: 'date', width: 15 },
            { header: '支出金额', key: 'amount', width: 15 },
        ];
        stats.dailyData.forEach(d => {
            dailySheet.addRow({ date: d.date, amount: d.amount });
        });
        const catSheet = workbook.addWorksheet('分类占比');
        catSheet.columns = [
            { header: '分类', key: 'name', width: 15 },
            { header: 'emoji', key: 'emoji', width: 8 },
            { header: '金额', key: 'amount', width: 15 },
            { header: '占比%', key: 'percentage', width: 10 },
        ];
        stats.categoryData.forEach(c => {
            catSheet.addRow({ name: c.name, emoji: c.emoji, amount: c.amount, percentage: c.percentage });
        });
        const records = await this.prisma.expenseRecord.findMany({
            where: {
                userId,
                status: 1,
                recordDate: {
                    gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                    lte: new Date(),
                },
            },
            include: { category: true },
            orderBy: { recordDate: 'desc' },
        });
        const recordsSheet = workbook.addWorksheet('消费记录');
        recordsSheet.columns = [
            { header: '日期', key: 'date', width: 15 },
            { header: '分类', key: 'category', width: 10 },
            { header: '金额', key: 'amount', width: 12 },
            { header: '备注', key: 'note', width: 30 },
        ];
        records.forEach(r => {
            recordsSheet.addRow({
                date: new Date(r.recordDate).toISOString().split('T')[0],
                category: r.category.emoji + ' ' + r.category.name,
                amount: Number(r.amount),
                note: r.note || '',
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map