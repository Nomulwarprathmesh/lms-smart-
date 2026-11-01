import { Body, Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { AdminService } from './admin.service';
import { CreateDepartmentDto, CreateHodDto, EditHodDto, SetHodStatusDto } from './admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.admin.me(user.id);
  }

  @Get('overview')
  overview() {
    return this.admin.overview();
  }

  @Get('departments')
  departments() {
    return this.admin.departments();
  }

  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.admin.createDepartment(dto);
  }

  @Get('hods')
  hods() {
    return this.admin.hods();
  }

  @Post('hods')
  createHod(@Body() dto: CreateHodDto, @CurrentUser() user: AuthUser) {
    return this.admin.createHod(dto, user.id);
  }

  @Patch('hods/:id')
  editHod(@Param('id') id: string, @Body() dto: EditHodDto, @CurrentUser() user: AuthUser) {
    return this.admin.editHod(id, dto, user.id);
  }

  @Patch('hods/:id/status')
  setHodStatus(@Param('id') id: string, @Body() dto: SetHodStatusDto, @CurrentUser() user: AuthUser) {
    return this.admin.setHodStatus(id, dto, user.id);
  }

  @Post('hods/:id/reset-password')
  resetHodPassword(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.admin.resetHodPassword(id, user.id);
  }
}
