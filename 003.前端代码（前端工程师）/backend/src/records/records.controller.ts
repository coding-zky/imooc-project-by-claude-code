import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { RecordsService } from './records.service'
import { CreateRecordDto, UpdateRecordDto, QueryRecordsDto } from './dto/records.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateRecordDto) {
    return this.recordsService.create(req.user.id, dto)
  }

  @Get()
  findAll(@Request() req, @Query() query: QueryRecordsDto) {
    return this.recordsService.findAll(req.user.id, query)
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.recordsService.findOne(req.user.id, id)
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateRecordDto) {
    return this.recordsService.update(req.user.id, id, dto)
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.recordsService.remove(req.user.id, id)
  }
}