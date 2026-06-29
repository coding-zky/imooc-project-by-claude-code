import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as ExcelJS from 'exceljs'

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: bigint, days: number) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

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
    })

    // Calculate totals
    const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0)

    // Daily breakdown
    const dailyMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      dailyMap.set(key, 0)
    }
    records.forEach(r => {
      const key = new Date(r.recordDate).toISOString().split('T')[0]
      dailyMap.set(key, (dailyMap.get(key) || 0) + Number(r.amount))
    })
    const dailyData = Array.from(dailyMap.entries()).map(([date, amount]) => ({
      date,
      amount,
      label: date.slice(5), // MM-DD
    }))

    // Category breakdown
    const categoryMap = new Map<string, { name: string; emoji: string; amount: number }>()
    records.forEach(r => {
      const key = r.categoryId.toString()
      const existing = categoryMap.get(key)
      if (existing) {
        existing.amount += Number(r.amount)
      } else {
        categoryMap.set(key, {
          name: r.category.name,
          emoji: r.category.emoji,
          amount: Number(r.amount),
        })
      }
    })
    const categoryData = Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        categoryId: id,
        name: data.name,
        emoji: data.emoji,
        amount: data.amount,
        percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    return {
      totalAmount,
      recordCount: records.length,
      avgDaily: days > 0 ? totalAmount / days : 0,
      dailyData,
      categoryData,
    }
  }

  async exportExcel(userId: bigint, days: number) {
    const stats = await this.getStats(userId, days)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'LightLedger'
    workbook.created = new Date()

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('概览')
    summarySheet.columns = [
      { header: '指标', key: 'key', width: 20 },
      { header: '数值', key: 'value', width: 20 },
    ]
    summarySheet.addRow({ key: '统计周期', value: `最近${days}天` })
    summarySheet.addRow({ key: '总支出', value: `¥ ${stats.totalAmount.toFixed(2)}` })
    summarySheet.addRow({ key: '日均消费', value: `¥ ${stats.avgDaily.toFixed(2)}` })
    summarySheet.addRow({ key: '记录笔数', value: stats.recordCount })

    // Sheet 2: Daily Trend
    const dailySheet = workbook.addWorksheet('每日趋势')
    dailySheet.columns = [
      { header: '日期', key: 'date', width: 15 },
      { header: '支出金额', key: 'amount', width: 15 },
    ]
    stats.dailyData.forEach(d => {
      dailySheet.addRow({ date: d.date, amount: d.amount })
    })

    // Sheet 3: Category Breakdown
    const catSheet = workbook.addWorksheet('分类占比')
    catSheet.columns = [
      { header: '分类', key: 'name', width: 15 },
      { header: 'emoji', key: 'emoji', width: 8 },
      { header: '金额', key: 'amount', width: 15 },
      { header: '占比%', key: 'percentage', width: 10 },
    ]
    stats.categoryData.forEach(c => {
      catSheet.addRow({ name: c.name, emoji: c.emoji, amount: c.amount, percentage: c.percentage })
    })

    // Sheet 4: Raw Records
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
    })
    const recordsSheet = workbook.addWorksheet('消费记录')
    recordsSheet.columns = [
      { header: '日期', key: 'date', width: 15 },
      { header: '分类', key: 'category', width: 10 },
      { header: '金额', key: 'amount', width: 12 },
      { header: '备注', key: 'note', width: 30 },
    ]
    records.forEach(r => {
      recordsSheet.addRow({
        date: new Date(r.recordDate).toISOString().split('T')[0],
        category: r.category.emoji + ' ' + r.category.name,
        amount: Number(r.amount),
        note: r.note || '',
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }
}