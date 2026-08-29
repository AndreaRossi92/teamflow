import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Role, User } from './user.entity';
import { Roles } from '../auth/decorators/auth.decorators';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from '../auth/auth.service';
import { ListUsersDto } from './dto/list-users.dto';
import { Paginated, PaginatedResponseDto } from '../paginated-response.dto';
import { UserDashboardDto } from './dto/user-dashboard.dto';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { Request } from 'express';

class PaginatedUsersResponse extends PaginatedResponseDto(User) {}

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ type: PaginatedUsersResponse })
  findAll(@Query() query: ListUsersDto): Promise<Paginated<User>> {
    return this.usersService.findAll(query);
  }

  @Get('me/workload')
  @Roles(Role.ADMIN, Role.MANAGER, Role.DEV)
  @ApiOperation({ summary: 'Logged user workload' })
  @ApiOkResponse({ type: UserDashboardDto })
  getMyWorkload(@Req() req: Request): Promise<UserDashboardDto> {
    return this.usersService.getUserWorkload((req.user as JwtUser).id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: User })
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an active user' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.deactivateUser(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate an inactive user' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  reactivate(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.reactivateUser(id);
  }

  @Patch(':id/reset-password')
  @ApiOperation({
    summary:
      'Reset a user password (admin only) — invalidates all active sessions for that user',
  })
  @ApiNoContentResponse({ description: 'Password reset successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<void> {
    await this.usersService.resetUserPassword(id, dto.newPassword);
    await this.authService.revokeAllUserSessions(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Hard-delete an inactive user (admin only) — irreversible. Deactivate the user first.',
  })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
