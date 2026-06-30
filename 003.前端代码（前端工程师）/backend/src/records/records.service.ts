import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Decimal } from '@prisma/client/runtime/library'
import { CreateRecordDto, UpdateRecordDto, QueryRecordsDto } from './dto/records.dto'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serialize = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'bigint') return Number(obj)
  if (obj instanceof Decimal) return Number(obj.toString())
  if (obj instanceof Date) return obj.toISOString()
  if (Array.isArray(obj)) return obj.map(serialize)
  if (typeof obj === 'object') {
    const result: any = {}
    for (const key of Object.keys(obj)) {
      result[key] = serialize(obj[key])
    }
    return result
  }
  return obj
}

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

    return serialize(record)
  }

  async findAll(userId: bigint, query: QueryRecordsDto) {
    const { month, categoryId, startDate, endDate, page = 1, pageSize = 20, sortBy = 'recordDate', sortOrder = 'desc' } = query

    const where: any = {
      userId,
      status: 1,
    }

    if (month) {
      const [year, m] = month.split('-')
      // Use UTC dates to avoid timezone mismatch with MySQL
      const startDate = new Date(Date.UTC(parseInt(year), parseInt(m) - 1, 1, 0, 0, 0, 0))
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(m), 0, 23, 59, 59, 999))
      where.recordDate = {
        gte: startDate,
        lte: endDate,
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
      records: records.map(r => serialize(r)),
      pagination: {
        page,
        pageSize,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / pageSize),
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

    return serialize(record)
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

    return serialize(updated)
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