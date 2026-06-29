import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.expenseCategory.count()
    if (count === 0) {
      await this.seedCategories()
    }
  }

  private async seedCategories() {
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
    ]

    await this.prisma.expenseCategory.createMany({
      data: categories.map(c => ({
        ...c,
        isSystem: 1,
        status: 1,
      })),
    })
  }

  async findAll() {
    const categories = await this.prisma.expenseCategory.findMany({
      where: { status: 1 },
      orderBy: { sortOrder: 'asc' },
    })
    return categories.map(c => ({
      ...c,
      id: c.id.toString(),
    }))
  }
}