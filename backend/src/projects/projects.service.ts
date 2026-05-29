import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Project } from './project.entity';
import { User, Role } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUsersDto } from './dto/assign-users.dto';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { ErrorCode } from '../app-error.codes';

const PROJECT_RELATIONS = ['members', 'createdBy'];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllForUser(requestingUser: JwtUser): Promise<Project[]> {
    if (requestingUser.role === Role.ADMIN) {
      return this.projectRepo.find({ relations: PROJECT_RELATIONS });
    }

    // Managers and Devs: only projects they are assigned to
    return this.projectRepo
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
      .getMany();
  }

  async findOneForUser(id: string, requestingUser: JwtUser): Promise<Project> {
    return this.findProjectWithAccess(id, requestingUser);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

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

  // ── Helpers ────────────────────────────────────────────────────────────────

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
