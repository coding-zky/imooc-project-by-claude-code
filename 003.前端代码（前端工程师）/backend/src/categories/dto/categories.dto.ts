import { IsString, IsNumber, IsOptional } from 'class-validator'

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  emoji?: string

  @IsNumber()
  @IsOptional()
  sortOrder?: number
}