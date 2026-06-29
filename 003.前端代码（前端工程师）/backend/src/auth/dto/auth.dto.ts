import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  username: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string

  @IsEmail()
  @IsOptional()
  email?: string
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  password: string
}
