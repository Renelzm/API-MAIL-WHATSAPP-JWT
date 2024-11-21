import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateRolDto, CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register/user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('register/rol')
  @RoleProtected('admin')
  @UseGuards( AuthGuard('jwt'), UserRoleGuard )
  createRol(@Body() createRolDto: CreateRolDto) {
    return this.authService.createRol(createRolDto);
  }
  @Post('login')
  loginUser( @Body() loginUserDto: LoginUserDto){
    return this.authService.login(loginUserDto);
  }

  @Get('roles')
  @RoleProtected('admin')
  @UseGuards( AuthGuard('jwt'), UserRoleGuard )
  findAllRoles() {
    return this.authService.findAllRoles();
  }

  @Get('roles/:role')
  findOnebyRole(@Param('role') role: string) {
    return this.authService.findOneRole(role);
  }

  @Get(':id')
  @RoleProtected('admin', 'general')
  @UseGuards(AuthGuard('jwt'), UserRoleGuard )
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}

