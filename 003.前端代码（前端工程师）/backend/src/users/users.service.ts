import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import { UpdateProfileDto, ChangePasswordDto, BindPhoneDto } from './dto/user.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('用户不存在')
    return { ...user, id: Number(user.id) }
  }

  async updateProfile(userId: bigint, dto: UpdateProfileDto) {
    const data: any = {}
    if (dto.email !== undefined) data.email = dto.email
    if (dto.avatar !== undefined) data.avatar = dto.avatar

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    })
    return { ...user, id: Number(user.id) }
  }

  async changePassword(userId: bigint, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('用户不存在')

    const isValid = await bcrypt.compare(dto.oldPassword, user.password)
    if (!isValid) throw new UnauthorizedException('原密码错误')

    const hashed = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return { success: true, message: '密码修改成功' }
  }

  async bindPhone(userId: bigint, dto: BindPhoneDto) {
    if (!dto.phone || dto.phone.length < 11) {
      throw new BadRequestException('请输入有效的手机号')
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { phone: dto.phone },
    })

    return { success: true, message: '手机绑定成功' }
  }

  async getPreferences(userId: bigint) {
    let pref = await this.prisma.userPreference.findUnique({
      where: { userId },
    })

    if (!pref) {
      pref = await this.prisma.userPreference.create({
        data: { userId },
      })
    }

    return {
      ...pref,
      id: Number(pref.id),
      userId: Number(pref.userId),
      pageSize: String(pref.pageSize),
    }
  }

  async updatePreferences(userId: bigint, dto: any) {
    const data: any = {}
    if (dto.defaultPage !== undefined) data.defaultPage = dto.defaultPage
    if (dto.pageSize !== undefined) data.pageSize = parseInt(dto.pageSize)
    if (dto.reminderEnabled !== undefined) data.reminderEnabled = dto.reminderEnabled ? 1 : 0

    let pref = await this.prisma.userPreference.findUnique({
      where: { userId },
    })

    if (!pref) {
      pref = await this.prisma.userPreference.create({
        data: { userId, ...data },
      })
    } else {
      pref = await this.prisma.userPreference.update({
        where: { userId },
        data,
      })
    }

    return {
      ...pref,
      id: Number(pref.id),
      userId: Number(pref.userId),
      pageSize: String(pref.pageSize),
    }
  }
}