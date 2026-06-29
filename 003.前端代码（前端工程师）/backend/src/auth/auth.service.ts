import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    })

    if (existing) {
      throw new ConflictException('用户名已存在')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        email: dto.email,
      },
    })

    // 创建默认偏好设置
    await this.prisma.userPreference.create({
      data: {
        userId: user.id,
      },
    })

    const token = this.generateToken(Number(user.id), user.username)

    return {
      user: {
        id: Number(user.id),
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    })

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账户已被禁用')
    }

    const token = this.generateToken(Number(user.id), user.username)

    return {
      user: {
        id: Number(user.id),
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    }
  }

  private generateToken(userId: number, username: string) {
    const payload = { sub: userId, username }
    return this.jwtService.sign(payload)
  }
}
