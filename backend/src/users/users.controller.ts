import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
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
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from '../auth/auth.service';

@Crud({
  model: { type: User },
  routes: {
    only: ['createOneBase', 'getManyBase', 'getOneBase', 'updateOneBase'],
  },
  dto: {
    create: CreateUserDto,
    update: UpdateUserDto,
    replace: CreateUserDto,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    exclude: ['passwordHash'],
  },
})
@ApiCookieAuth()
@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController implements CrudController<User> {
  constructor(
    public service: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  create(@Body() dto: CreateUserDto) {
    return this.service.createUser(dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate an active user' })
  @ApiOkResponse({ type: User })
  deactivate(@Param('id') id: string) {
    return this.service.deactivateUser(id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivates an inactive user' })
  @ApiOkResponse({ type: User })
  reactivate(@Param('id') id: string) {
    return this.service.reactivateUser(id);
  }

  @Patch(':id/reset-password')
  @ApiOperation({
    summary:
      'Reset a user password (admin only) — invalidates all active sessions for that user',
  })
  @ApiNoContentResponse({ description: 'Password reset successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<void> {
    await this.service.resetUserPassword(id, dto.newPassword);
    await this.authService.revokeAllUserSessions(id);
  }
}
