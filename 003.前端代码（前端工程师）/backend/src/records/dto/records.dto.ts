import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateRecordDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number

  @IsString()
  categoryId: string

  @IsDateString()
  recordDate: string

  @IsString()
  @IsOptional()
  note?: string
}

export class UpdateRecordDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number

  @IsString()
  @IsOptional()
  categoryId?: string

  @IsDateString()
  @IsOptional()
  recordDate?: string

  @IsString()
  @IsOptional()
  note?: string
}

export class QueryRecordsDto {
  @IsOptional()
  @IsString()
  month?: string // YYYY-MM

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 20

  @IsOptional()
  @IsString()
  sortBy?: string = 'recordDate'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc'
}