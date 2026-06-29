import { Controller, Get, Query, UseGuards, Request, Res, Header } from '@nestjs/common'
import type { Response } from 'express'
import { StatsService } from './stats.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getStats(@Request() req, @Query('days') days: string) {
    const daysNum = parseInt(days) || 7
    return this.statsService.getStats(req.user.id, daysNum)
  }

  @Get('export')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportExcel(@Request() req, @Query('days') days: string, @Res() res: Response) {
    const daysNum = parseInt(days) || 7
    const buffer = await this.statsService.exportExcel(req.user.id, daysNum)

    const filename = encodeURIComponent(`轻账本统计报表_${daysNum}天_${new Date().toISOString().split('T')[0]}.xlsx`)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  }
}