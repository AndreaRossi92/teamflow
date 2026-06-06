import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { Project } from '../projects/project.entity';
import { User, Role } from '../users/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketUsersDto } from './dto/assign-ticket-users.dto';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { ErrorCode } from '../app-error.codes';
import { Paginated } from '../paginated-response.dto';

const TICKET_RELATIONS = ['assignees', 'createdBy', 'project'];

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAllForUser(
    requestingUser: JwtUser,
    query: ListTicketsDto,
  ): Promise<Paginated<Ticket>> {
    const { title, status, priority, projectId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.assignees', 'assignees')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.project', 'project')
      .orderBy('ticket.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    if (requestingUser.role === Role.MANAGER) {
      qb.where((qb) => {
        const sub = qb
          .subQuery()
          .select('pm.projectId')
          .from('project_members', 'pm')
          .where('pm.userId = :userId')
          .getQuery();
        return `ticket.projectId IN ${sub}`;
      });
    } else if (requestingUser.role === Role.DEV) {
      // Dev: only tickets assigned to them
      qb.where((qb) => {
        const sub = qb
          .subQuery()
          .select('ta.ticketId')
          .from('ticket_assignees', 'ta')
          .where('ta.userId = :userId')
          .getQuery();
        return `ticket.id IN ${sub}`;
      });
    }

    qb.setParameter('userId', requestingUser.id);

    if (title !== undefined) {
      qb.andWhere('ticket.title ILIKE :title', { title: `%${title}%` });
    }
    if (status !== undefined) {
      qb.andWhere('ticket.status = :status', { status });
    }
    if (priority !== undefined) {
      qb.andWhere('ticket.priority = :priority', { priority });
    }
    if (projectId !== undefined) {
      qb.andWhere('ticket.projectId = :projectId', { projectId });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, hasNextPage: page * limit < total };
  }

  async findOneForUser(id: string, requestingUser: JwtUser): Promise<Ticket> {
    return this.findTicketWithAccess(id, requestingUser);
  }

  async createTicket(
    dto: CreateTicketDto,
    requestingUser: JwtUser,
  ): Promise<Ticket> {
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
      relations: ['members'],
    });
    if (!project) throw new NotFoundException(ErrorCode.PROJECT_NOT_FOUND);

    // Manager must be a member of the project
    if (requestingUser.role !== Role.ADMIN) {
      const isMember = project.members.some((m) => m.id === requestingUser.id);
      if (!isMember)
        throw new ForbiddenException(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    const creator = await this.userRepo.findOne({
      where: { id: requestingUser.id },
    });
    if (!creator) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    let assignees: User[] = [];
    if (dto.assigneeIds && dto.assigneeIds.length > 0) {
      assignees = await this.resolveProjectMembers(dto.assigneeIds, project);
    }

    const ticket = this.ticketRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority,
      status: TicketStatus.OPEN,
      projectId: dto.projectId,
      project,
      createdById: creator.id,
      createdBy: creator,
      assignees,
    });

    return this.ticketRepo.save(ticket);
  }

  async updateTicket(
    id: string,
    dto: UpdateTicketDto,
    requestingUser: JwtUser,
  ): Promise<Ticket> {
    const ticket = await this.findTicketWithAccess(id, requestingUser, {
      requireManagerAccess: true,
    });

    if (dto.assigneeIds !== undefined) {
      const project = await this.projectRepo.findOne({
        where: { id: ticket.projectId },
        relations: ['members'],
      });
      if (!project) throw new NotFoundException(ErrorCode.PROJECT_NOT_FOUND);
      ticket.assignees = await this.resolveProjectMembers(
        dto.assigneeIds,
        project,
      );
    }

    const { assigneeIds: _ignored, projectId: _ignoredProject, ...rest } = dto;
    Object.assign(ticket, rest);

    return this.ticketRepo.save(ticket);
  }

  async updateTicketStatus(
    id: string,
    dto: UpdateTicketStatusDto,
    requestingUser: JwtUser,
  ): Promise<Ticket> {
    const ticket = await this.findTicketWithAccess(id, requestingUser);

    if (requestingUser.role === Role.DEV) {
      const isAssignee = ticket.assignees.some(
        (a) => a.id === requestingUser.id,
      );
      if (!isAssignee)
        throw new ForbiddenException(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    ticket.status = dto.status;
    return this.ticketRepo.save(ticket);
  }

  async assignUsers(
    id: string,
    dto: AssignTicketUsersDto,
    requestingUser: JwtUser,
  ): Promise<Ticket> {
    const ticket = await this.findTicketWithAccess(id, requestingUser, {
      requireManagerAccess: true,
    });

    const project = await this.projectRepo.findOne({
      where: { id: ticket.projectId },
      relations: ['members'],
    });
    if (!project) throw new NotFoundException(ErrorCode.PROJECT_NOT_FOUND);

    ticket.assignees = await this.resolveProjectMembers(dto.userIds, project);
    return this.ticketRepo.save(ticket);
  }

  async deleteTicket(id: string, requestingUser: JwtUser): Promise<void> {
    await this.findTicketWithAccess(id, requestingUser, {
      requireManagerAccess: true,
    });
    await this.ticketRepo.delete(id);
  }

  /**
   * Loads the ticket and enforces visibility rules.
   *
   * requireManagerAccess = true → DEVs are never allowed (used for
   * create/update/assign/delete endpoints restricted to admin/manager).
   */
  private async findTicketWithAccess(
    id: string,
    requestingUser: JwtUser,
    options: { requireManagerAccess?: boolean } = {},
  ): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: TICKET_RELATIONS,
    });

    if (!ticket) throw new NotFoundException(ErrorCode.TICKET_NOT_FOUND);

    if (requestingUser.role === Role.ADMIN) return ticket;

    // Verify the requesting user is a member of the ticket's project
    const project = await this.projectRepo.findOne({
      where: { id: ticket.projectId },
      relations: ['members'],
    });
    if (!project) throw new NotFoundException(ErrorCode.PROJECT_NOT_FOUND);

    const isProjectMember = project.members.some(
      (m) => m.id === requestingUser.id,
    );
    if (!isProjectMember)
      throw new ForbiddenException(ErrorCode.PROJECT_ACCESS_DENIED);

    if (options.requireManagerAccess && requestingUser.role === Role.DEV) {
      throw new ForbiddenException(ErrorCode.PROJECT_ACCESS_DENIED);
    }

    return ticket;
  }

  /**
   * Given a list of userIds, loads the users and asserts that every one of
   * them is a member of the given project. Throws NotFoundException if any
   * userId doesn't resolve to a user, BadRequestException if any resolved
   * user is not a project member.
   */
  private async resolveProjectMembers(
    userIds: string[],
    project: Project,
  ): Promise<User[]> {
    if (userIds.length === 0) return [];

    const users = await this.userRepo.findBy({ id: In(userIds) });
    if (users.length !== userIds.length) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const memberIds = new Set(project.members.map((m) => m.id));
    const nonMembers = users.filter((u) => !memberIds.has(u.id));
    if (nonMembers.length > 0) {
      throw new BadRequestException(ErrorCode.USER_NOT_PROJECT_MEMBER);
    }

    return users;
  }
}
