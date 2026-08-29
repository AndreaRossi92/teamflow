import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { ErrorCode } from '../app-error.codes';
import { Paginated } from '../paginated-response.dto';
import { Ticket, TicketPriority, TicketStatus } from '../tickets/ticket.entity';
import {
  emptyTicketBreakdown,
  UserDashboardDto,
} from './dto/user-dashboard.dto';

interface UserTicketBreakdownRow {
  userId: string;
  status: TicketStatus;
  priority: TicketPriority;
  count: string;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  async getTicketBreakdownByUser(): Promise<UserDashboardDto[]> {
    const users = await this.repo.find({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { fullName: 'ASC' },
    });

    if (users.length === 0) return [];

    const userIds = users.map((u) => u.id);

    const rows = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoin('ticket.assignees', 'assignee')
      .select('assignee.id', 'userId')
      .addSelect('ticket.status', 'status')
      .addSelect('ticket.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('assignee.id IN (:...userIds)', { userIds })
      .groupBy('assignee.id')
      .addGroupBy('ticket.status')
      .addGroupBy('ticket.priority')
      .getRawMany<UserTicketBreakdownRow>();

    const breakdownByUser = new Map<
      string,
      Record<TicketStatus, Record<TicketPriority, number>>
    >();

    for (const row of rows) {
      const breakdown =
        breakdownByUser.get(row.userId) ?? emptyTicketBreakdown();
      breakdown[row.status][row.priority] = Number(row.count);
      breakdownByUser.set(row.userId, breakdown);
    }

    return users.map((user) => ({
      ...user,
      ticketBreakdown: breakdownByUser.get(user.id) ?? emptyTicketBreakdown(),
    }));
  }

  async findAll(query: ListUsersDto): Promise<Paginated<User>> {
    const { fullName, role, isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User> = {};
    if (fullName !== undefined) where.fullName = ILike(`%${fullName}%`);
    if (role !== undefined) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await this.repo.findAndCount({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      order: { fullName: 'ASC' },
      take: limit,
      skip,
    });

    return { data, total, page, limit, hasNextPage: page * limit < total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(ErrorCode.USER_EMAIL_ALREADY_EXISTS);
      }
      throw new ConflictException(ErrorCode.USER_INACTIVE);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ ...dto, passwordHash });
    return this.repo.save(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async deactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user.isActive)
      throw new BadRequestException(ErrorCode.USER_ALREADY_INACTIVE);
    user.isActive = false;
    return this.repo.save(user);
  }

  async reactivateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (user.isActive)
      throw new BadRequestException(ErrorCode.USER_ALREADY_ACTIVE);
    user.isActive = true;
    return this.repo.save(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.update(id, { passwordHash });
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    if (user) await this.updatePassword(id, newPassword);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (user.isActive) {
      throw new BadRequestException(ErrorCode.USER_MUST_BE_INACTIVE_TO_DELETE);
    }
    await this.repo.delete(id);
  }
}
