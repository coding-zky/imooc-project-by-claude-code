import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRecordDto, UpdateRecordDto, QueryRecordsDto } from './dto/records.dto'

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: bigint, dto: CreateRecordDto) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: BigInt(dto.categoryId) },
    })

    if (!category) {
      throw new NotFoundException('消费分类不存在')
    }

    const id = crypto.randomUUID()
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
    })

    return {
      ...record,
      categoryId: record.categoryId.toString(),
      userId: record.userId.toString(),
    }
  }

  async findAll(userId: bigint, query: QueryRecordsDto) {
    const { month, categoryId, startDate, endDate, page = 1, pageSize = 20, sortBy = 'recordDate', sortOrder = 'desc' } = query

    const where: any = {
      userId,
      status: 1,
    }

    if (month) {
      const [year, m] = month.split('-')
      const start = new Date(parseInt(year), parseInt(m) - 1, 1)
      const end = new Date(parseInt(year), parseInt(m), 0)
      where.recordDate = {
        gte: start,
        lte: end,
      }
    }

    if (categoryId) {
      where.categoryId = BigInt(categoryId)
    }

    if (startDate) {
      where.recordDate = {
        ...where.recordDate,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.recordDate = {
        ...where.recordDate,
        lte: new Date(endDate),
      }
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
    ])

    return {
      records: records.map(r => ({
        ...r,
        categoryId: r.categoryId.toString(),
        userId: r.userId.toString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findOne(userId: bigint, id: string) {
    const record = await this.prisma.expenseRecord.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!record) {
      throw new NotFoundException('记录不存在')
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('无权访问此记录')
    }

    return {
      ...record,
      categoryId: record.categoryId.toString(),
      userId: record.userId.toString(),
    }
  }

  async update(userId: bigint, id: string, dto: UpdateRecordDto) {
    const record = await this.prisma.expenseRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('记录不存在')
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('无权修改此记录')
    }

    const updateData: any = {}
    if (dto.amount !== undefined) updateData.amount = dto.amount
    if (dto.categoryId !== undefined) updateData.categoryId = BigInt(dto.categoryId)
    if (dto.recordDate !== undefined) updateData.recordDate = new Date(dto.recordDate)
    if (dto.note !== undefined) updateData.note = dto.note

    const updated = await this.prisma.expenseRecord.update({
      where: { id },
      data: updateData,
      include: { category: true },
    })

    return {
      ...updated,
      categoryId: updated.categoryId.toString(),
      userId: updated.userId.toString(),
    }
  }

  async remove(userId: bigint, id: string) {
    const record = await this.prisma.expenseRecord.findUnique({
      where: { id },
    })

    if (!record) {
      throw new NotFoundException('记录不存在')
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('无权删除此记录')
    }

    await this.prisma.expenseRecord.delete({
      where: { id },
    })

    return { success: true }
  }
}