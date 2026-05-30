import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Not, Repository } from 'typeorm';
import { Project } from './project.entity';
import { User, Role } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUsersDto } from './dto/assign-users.dto';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { ErrorCode } from '../app-error.codes';
import { ListProjectsDto } from './dto/list-projects.dto';
import { Paginated } from '../paginated-response.dto';

const PROJECT_RELATIONS = ['members', 'createdBy'];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllForUser(
    requestingUser: JwtUser,
    query: ListProjectsDto,
  ): Promise<Paginated<Project>> {
    const { name, isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    if (requestingUser.role === Role.ADMIN) {
      const where: FindOptionsWhere<Project> = {};
      if (name !== undefined) where.name = ILike(`%${name}%`);
      if (isActive !== undefined) where.isActive = isActive;

      const [data, total] = await this.projectRepo.findAndCount({
        where,
        relations: PROJECT_RELATIONS,
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      });

      return { data, total, page, limit, hasNextPage: page * limit < total };
    }

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.createdBy', 'createdBy')
      .leftJoinAndSelect('project.members', 'members')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('pm.projectId')
          .from('project_members', 'pm')
          .where('pm.userId = :userId')
          .getQuery();
        return `project.id IN ${sub}`;
      })
      .setParameter('userId', requestingUser.id)
      .orderBy('project.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    if (name !== undefined) {
      qb.andWhere('project.name ILIKE :name', { name: `%${name}%` });
    }
    if (isActive !== undefined) {
      qb.andWhere('project.isActive = :isActive', { isActive });
    }

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, hasNextPage: page * limit < total };
  }

  async findOneForUser(id: string, requestingUser: JwtUser): Promise<Project> {
    return this.findProjectWithAccess(id, requestingUser);
  }

  async createProject(
    dto: CreateProjectDto,
    requestingUser: JwtUser,
  ): Promise<Project> {
    const creator = await this.userRepo.findOne({
      where: { id: requestingUser.id },
    });
    if (!creator) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      createdById: creator.id,
      createdBy: creator,
      members: [creator], // creator is always the first member
    });

    return this.projectRepo.save(project);
  }

  async updateProject(
    id: string,
    dto: UpdateProjectDto,
    requestingUser: JwtUser,
  ): Promise<Project> {
    const project = await this.findProjectWithAccess(id, requestingUser);
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async assignUsers(
    id: string,
    dto: AssignUsersDto,
    requestingUser: JwtUser,
  ): Promise<Project> {
    const project = await this.findProjectWithAccess(id, requestingUser);

    const users = await this.userRepo.findBy({ id: In(dto.userIds) });

    if (users.length !== dto.userIds.length) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    project.members = users;
    return this.projectRepo.save(project);
  }

  async deactivateProject(
    id: string,
    requestingUser: JwtUser,
  ): Promise<Project> {
    const project = await this.findProjectWithAccess(id, requestingUser);
    if (!project.isActive)
      throw new BadRequestException(ErrorCode.PROJECT_ALREADY_INACTIVE);

    project.isActive = false;
    return this.projectRepo.save(project);
  }

  async reactivateProject(
    id: string,
    requestingUser: JwtUser,
  ): Promise<Project> {
    const project = await this.findProjectWithAccess(id, requestingUser);
    if (project.isActive)
      throw new BadRequestException(ErrorCode.PROJECT_ALREADY_ACTIVE);

    project.isActive = true;
    return this.projectRepo.save(project);
  }

  async getAssignableUsers(
    projectId: string,
    requestingUser: JwtUser,
  ): Promise<
    (Pick<User, 'id' | 'fullName' | 'email' | 'role'> & { isMember: boolean })[]
  > {
    const project = await this.findProjectWithAccess(projectId, requestingUser);
    const memberIds = new Set(project.members.map((m) => m.id));

    const users = await this.userRepo.find({
      where: { isActive: true, role: Not(Role.ADMIN) },
      select: ['id', 'fullName', 'email', 'role'],
    });

    return users.map((u) => ({ ...u, isMember: memberIds.has(u.id) }));
  }

  private async findProjectWithAccess(
    id: string,
    requestingUser: JwtUser,
  ): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: PROJECT_RELATIONS,
    });

    if (!project) throw new NotFoundException(ErrorCode.PROJECT_NOT_FOUND);

    if (requestingUser.role !== Role.ADMIN) {
      const isMember = project.members.some((m) => m.id === requestingUser.id);
      if (!isMember)
        throw new ForbiddenException(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    return project;
  }
}
