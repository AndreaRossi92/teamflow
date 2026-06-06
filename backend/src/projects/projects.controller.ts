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
import { Request } from 'express';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUsersDto } from './dto/assign-users.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { Role } from '../users/user.entity';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { UserWithMemberDto } from './dto/users-with-member.dto';
import { ListProjectsDto } from './dto/list-projects.dto';
import { ListAssignableUsersDto } from './dto/list-assignable-users.dto';
import { Paginated, PaginatedResponseDto } from '../paginated-response.dto';

class PaginatedProjectsResponse extends PaginatedResponseDto(Project) {}

@ApiTags('Projects')
@ApiCookieAuth()
@Controller('projects')
@UseGuards(JwtGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List projects visible to the current user — admins see all, others see only assigned ones',
  })
  @ApiOkResponse({ type: PaginatedProjectsResponse })
  findAll(
    @Req() req: Request,
    @Query() query: ListProjectsDto,
  ): Promise<Paginated<Project>> {
    return this.projectsService.findAllForUser(req.user as JwtUser, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project (must be assigned or admin)' })
  @ApiOkResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Project> {
    return this.projectsService.findOneForUser(id, req.user as JwtUser);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a project — creator is auto-assigned as first member',
  })
  @ApiCreatedResponse({ type: Project })
  create(@Body() dto: CreateProjectDto, @Req() req: Request): Promise<Project> {
    return this.projectsService.createProject(dto, req.user as JwtUser);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update a project (admin or assigned manager)',
  })
  @ApiOkResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: Request,
  ): Promise<Project> {
    return this.projectsService.updateProject(id, dto, req.user as JwtUser);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary:
      'Replace the member list of a project (admin or assigned manager) — replaces existing assignments',
  })
  @ApiOkResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Project or user not found' })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  assignUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUsersDto,
    @Req() req: Request,
  ): Promise<Project> {
    return this.projectsService.assignUsers(id, dto, req.user as JwtUser);
  }

  @Get(':id/assignable-users')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary:
      'List all active non-admin users with isMember flag for a given project (admin or assigned manager)',
  })
  @ApiOkResponse({
    type: UserWithMemberDto,
    isArray: true,
    description: 'User list with isMember flag',
  })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  getAssignableUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListAssignableUsersDto,
    @Req() req: Request,
  ): Promise<UserWithMemberDto[]> {
    return this.projectsService.getAssignableUsers(
      id,
      req.user as JwtUser,
      query,
    );
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Deactivate a project (admin or assigned manager)',
  })
  @ApiOkResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Project> {
    return this.projectsService.deactivateProject(id, req.user as JwtUser);
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Reactivate a project (admin or assigned manager)',
  })
  @ApiOkResponse({ type: Project })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  reactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<Project> {
    return this.projectsService.reactivateProject(id, req.user as JwtUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Hard-delete an inactive project (admin only) — irreversible. Deactivate the project first.',
  })
  @ApiNoContentResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({ description: 'Not a member of this project' })
  async deleteProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    await this.projectsService.deleteProject(id, req.user as JwtUser);
  }
}
