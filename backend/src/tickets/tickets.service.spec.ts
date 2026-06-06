import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus, TicketPriority } from './ticket.entity';
import { Project } from '../projects/project.entity';
import { User, Role } from '../users/user.entity';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { ListTicketsDto } from './dto/list-tickets.dto';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const adminUser: JwtUser = {
  id: 'admin-uuid',
  email: 'admin@test.com',
  role: Role.ADMIN,
  fullName: 'Admin',
};

const managerUser: JwtUser = {
  id: 'manager-uuid',
  email: 'manager@test.com',
  role: Role.MANAGER,
  fullName: 'Manager',
};

const devUser: JwtUser = {
  id: 'dev-uuid',
  email: 'dev@test.com',
  role: Role.DEV,
  fullName: 'Dev',
};

const managerEntity: User = {
  id: managerUser.id,
  email: managerUser.email,
  fullName: managerUser.fullName,
  passwordHash: 'hash',
  role: Role.MANAGER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const devEntity: User = {
  id: devUser.id,
  email: devUser.email,
  fullName: devUser.fullName,
  passwordHash: 'hash',
  role: Role.DEV,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProject: Project = {
  id: 'project-uuid',
  name: 'TeamFlow v2',
  description: 'Main rewrite',
  isActive: true,
  createdById: managerUser.id,
  createdBy: managerEntity,
  members: [managerEntity, devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTicket: Ticket = {
  id: 'ticket-uuid',
  title: 'Fix login bug',
  description: 'Users cannot log in',
  status: TicketStatus.OPEN,
  priority: TicketPriority.HIGH,
  project: mockProject,
  createdBy: managerEntity,
  assignees: [devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  setParameter: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  subQuery: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  getQuery: jest.fn().mockReturnValue('(SELECT id FROM mock)'),
  getManyAndCount: jest.fn(),
};

const mockTicketRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockProjectRepo = {
  findOne: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
  findBy: jest.fn(),
};

async function buildModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      TicketsService,
      { provide: getRepositoryToken(Ticket), useValue: mockTicketRepo },
      { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
      { provide: getRepositoryToken(User), useValue: mockUserRepo },
    ],
  }).compile();
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('TicketsService', () => {
  let service: TicketsService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await buildModule();
    service = module.get<TicketsService>(TicketsService);
  });

  afterEach(async () => {
    await module.close();
  });

  // ── findAllForUser ──────────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    const baseQuery: ListTicketsDto = { page: 1, limit: 20 };

    it('should use a query builder for all roles', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);
      await service.findAllForUser(adminUser, baseQuery);
      expect(mockTicketRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should return a paginated result', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);
      const result = await service.findAllForUser(adminUser, baseQuery);
      expect(result).toMatchObject({
        data: [mockTicket],
        total: 1,
        page: 1,
        limit: 20,
        hasNextPage: false,
      });
    });

    it('should set hasNextPage true when more pages exist', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 25]);
      const result = await service.findAllForUser(adminUser, {
        page: 1,
        limit: 20,
      });
      expect(result.hasNextPage).toBe(true);
    });

    it('should apply title filter via ILIKE', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(adminUser, { ...baseQuery, title: 'login' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.title ILIKE :title',
        { title: '%login%' },
      );
    });

    it('should apply status filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(adminUser, {
        ...baseQuery,
        status: TicketStatus.OPEN,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.status = :status',
        { status: TicketStatus.OPEN },
      );
    });

    it('should apply priority filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(adminUser, {
        ...baseQuery,
        priority: TicketPriority.HIGH,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.priority = :priority',
        { priority: TicketPriority.HIGH },
      );
    });

    it('should apply projectId filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(adminUser, {
        ...baseQuery,
        projectId: mockProject.id,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.projectId = :projectId',
        { projectId: mockProject.id },
      );
    });

    it('should scope by user id for manager', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(managerUser, baseQuery);
      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'userId',
        managerUser.id,
      );
    });

    it('should scope by assignee for dev', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(devUser, baseQuery);
      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'userId',
        devUser.id,
      );
    });

    it('should compute skip correctly (page 2, limit 20 → skip 20)', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      await service.findAllForUser(adminUser, { page: 2, limit: 20 });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    });
  });

  // ── findOneForUser ──────────────────────────────────────────────────────────

  describe('findOneForUser', () => {
    it('should return the ticket for admin', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      const result = await service.findOneForUser(mockTicket.id, adminUser);
      expect(result).toBeDefined();
    });

    it('should return the ticket for a project member', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      const result = await service.findOneForUser(mockTicket.id, managerUser);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneForUser('bad-id', adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for a non-member non-admin', async () => {
      const otherDev: JwtUser = {
        id: 'other-dev',
        email: 'x@x.com',
        role: Role.DEV,
        fullName: 'X',
      };
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      // Project members are managerEntity and devEntity; otherDev is not in there
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        members: [managerEntity, devEntity],
      });
      await expect(
        service.findOneForUser(mockTicket.id, otherDev),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── createTicket ────────────────────────────────────────────────────────────

  describe('createTicket', () => {
    const dto = {
      title: 'New Ticket',
      priority: TicketPriority.MEDIUM,
      projectId: mockProject.id,
    };

    beforeEach(() => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockUserRepo.findOne.mockResolvedValue(managerEntity);
      mockTicketRepo.create.mockImplementation(
        (d: Partial<Ticket>) => ({ ...d }) as Ticket,
      );
      mockTicketRepo.save.mockImplementation((t) =>
        Promise.resolve({ ...mockTicket, ...t }),
      );
    });

    it('should set status to OPEN by default', async () => {
      await service.createTicket(dto, managerUser);
      const calls = mockTicketRepo.create.mock.calls as {
        status: TicketStatus;
      }[][];
      expect(calls[0][0].status).toBe(TicketStatus.OPEN);
    });

    it('should call create before save', async () => {
      const order: string[] = [];
      mockTicketRepo.create.mockImplementation((d: Partial<Ticket>) => {
        order.push('create');
        return d as Ticket;
      });
      mockTicketRepo.save.mockImplementation((t) => {
        order.push('save');
        return Promise.resolve(t);
      });
      await service.createTicket(dto, managerUser);
      expect(order).toEqual(['create', 'save']);
    });

    it('should throw NotFoundException when project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);
      await expect(service.createTicket(dto, managerUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when manager is not a project member', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        members: [],
      });
      await expect(service.createTicket(dto, managerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should resolve assignees that are project members', async () => {
      mockUserRepo.findBy = jest.fn().mockResolvedValue([devEntity]);
      await service.createTicket(
        { ...dto, assigneeIds: [devUser.id] },
        adminUser,
      );
      const calls = mockTicketRepo.create.mock.calls as {
        assignees: User[];
      }[][];
      expect(calls[0][0].assignees).toContainEqual(
        expect.objectContaining({ id: devUser.id }),
      );
    });

    it('should throw BadRequestException when assignee is not a project member', async () => {
      const outsider: User = { ...devEntity, id: 'outsider-uuid' };
      mockUserRepo.findBy = jest.fn().mockResolvedValue([outsider]);
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        members: [managerEntity],
      });
      await expect(
        service.createTicket(
          { ...dto, assigneeIds: ['outsider-uuid'] },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── updateTicket ────────────────────────────────────────────────────────────

  describe('updateTicket', () => {
    beforeEach(() => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));
    });

    it('should update and return the ticket', async () => {
      const result = await service.updateTicket(
        mockTicket.id,
        { title: 'Renamed' },
        adminUser,
      );
      expect(result.title).toBe('Renamed');
    });

    it('should throw ForbiddenException for a dev', async () => {
      await expect(
        service.updateTicket(mockTicket.id, { title: 'X' }, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateTicket('bad-id', { title: 'X' }, adminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateTicketStatus ──────────────────────────────────────────────────────

  describe('updateTicketStatus', () => {
    it('should update status for admin', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));
      const result = await service.updateTicketStatus(
        mockTicket.id,
        { status: TicketStatus.IN_PROGRESS },
        adminUser,
      );
      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should allow dev to update status on a ticket they are assigned to', async () => {
      mockTicketRepo.findOne.mockResolvedValue({
        ...mockTicket,
        assignees: [devEntity],
      });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));
      const result = await service.updateTicketStatus(
        mockTicket.id,
        { status: TicketStatus.RESOLVED },
        devUser,
      );
      expect(result.status).toBe(TicketStatus.RESOLVED);
    });

    it('should throw ForbiddenException for dev not assigned to the ticket', async () => {
      const otherDev: JwtUser = {
        id: 'other-dev',
        email: 'x@x.com',
        role: Role.DEV,
        fullName: 'X',
      };
      const otherDevEntity: User = { ...devEntity, id: 'other-dev' };
      // Project includes both devEntity and otherDevEntity as members
      mockTicketRepo.findOne.mockResolvedValue({
        ...mockTicket,
        assignees: [devEntity],
      });
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        members: [managerEntity, devEntity, otherDevEntity],
      });
      await expect(
        service.updateTicketStatus(
          mockTicket.id,
          { status: TicketStatus.CLOSED },
          otherDev,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── assignUsers ─────────────────────────────────────────────────────────────

  describe('assignUsers', () => {
    const dto = { userIds: [devUser.id] };

    beforeEach(() => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockUserRepo.findBy = jest.fn().mockResolvedValue([devEntity]);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));
    });

    it('should replace the assignee list', async () => {
      const result = await service.assignUsers(mockTicket.id, dto, adminUser);
      expect(result.assignees).toHaveLength(1);
    });

    it('should throw NotFoundException when any userId does not exist', async () => {
      mockUserRepo.findBy = jest.fn().mockResolvedValue([]);
      await expect(
        service.assignUsers(mockTicket.id, dto, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not a project member', async () => {
      const outsider: User = { ...devEntity, id: 'outsider' };
      mockUserRepo.findBy = jest.fn().mockResolvedValue([outsider]);
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        members: [managerEntity],
      });
      await expect(
        service.assignUsers(
          mockTicket.id,
          { userIds: ['outsider'] },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for dev', async () => {
      await expect(
        service.assignUsers(mockTicket.id, dto, devUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── deleteTicket ────────────────────────────────────────────────────────────

  describe('deleteTicket', () => {
    it('should call repo.delete with the ticket id', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteTicket(mockTicket.id, adminUser);
      expect(mockTicketRepo.delete).toHaveBeenCalledWith(mockTicket.id);
    });

    it('should resolve without returning a value', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteTicket(mockTicket.id, adminUser);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteTicket('bad-id', adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not call repo.delete when ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteTicket('bad-id', adminUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTicketRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for dev', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      await expect(
        service.deleteTicket(mockTicket.id, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should not call repo.delete when access is denied', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      await expect(
        service.deleteTicket(mockTicket.id, devUser),
      ).rejects.toThrow(ForbiddenException);
      expect(mockTicketRepo.delete).not.toHaveBeenCalled();
    });
  });
});
