import { IsString, IsOptional, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  avatar?: string
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string

  @IsString()
  @MinLength(6)
  newPassword: string
}

export class BindPhoneDto {
  @IsString()
  phone: string

  @IsString()
  code: string // SMS verification code - simplified, no actual SMS in V1.0
}

export class UpdatePreferencesDto {
  @IsString()
  @IsOptional()
  defaultPage?: string

  @IsOptional()
  @IsString()
  pageSize?: string

  @IsOptional()
  reminderEnabled?: boolean
}