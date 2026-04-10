import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { UsersService } from './users.service';
import { Role, User } from './user.entity';
import { Roles } from '../auth/decorators/auth.decorators';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiCookieAuth } from '@nestjs/swagger';

@Crud({
  model: { type: User },
  routes: {
    only: ['getManyBase', 'getOneBase', 'updateOneBase', 'deleteOneBase'],
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
  constructor(public service: UsersService) {}
}
