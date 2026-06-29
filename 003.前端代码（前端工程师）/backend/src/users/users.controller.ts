import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateProfileDto, ChangePasswordDto, BindPhoneDto, UpdatePreferencesDto } from './dto/user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id)
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto)
  }

  @Put('password')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto)
  }

  @Put('phone')
  bindPhone(@Request() req, @Body() dto: BindPhoneDto) {
    return this.usersService.bindPhone(req.user.id, dto)
  }

  @Get('preferences')
  getPreferences(@Request() req) {
    return this.usersService.getPreferences(req.user.id)
  }

  @Put('preferences')
  updatePreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.id, dto)
  }
}