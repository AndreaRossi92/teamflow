import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket, TicketPriority, TicketStatus } from './ticket.entity';
import { Project } from '../projects/project.entity';
import { User, Role } from '../users/user.entity';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { ListAssignableUsersDto } from './dto/list-assignable-users.dto';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const adminUser: JwtUser = {
  id: 'admin-uuid',
  email: 'admin@teamflow.com',
  role: Role.ADMIN,
  fullName: 'Admin',
};

const managerUser: JwtUser = {
  id: 'manager-uuid',
  email: 'manager@teamflow.com',
  role: Role.MANAGER,
  fullName: 'Manager',
};

const devUser: JwtUser = {
  id: 'dev-uuid',
  email: 'dev@teamflow.com',
  role: Role.DEV,
  fullName: 'Dev',
};

const otherDevUser: JwtUser = {
  id: 'other-dev-uuid',
  email: 'other-dev@teamflow.com',
  role: Role.DEV,
  fullName: 'Other Dev',
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

const otherDevEntity: User = {
  id: otherDevUser.id,
  email: otherDevUser.email,
  fullName: otherDevUser.fullName,
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
  createdBy: managerEntity,
  members: [managerEntity, devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const otherProject: Project = {
  id: 'other-project-uuid',
  name: 'Other Project',
  description: null,
  isActive: true,
  createdBy: managerEntity,
  members: [managerEntity, devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTicket: Ticket = {
  id: 'ticket-uuid',
  title: 'Fix login bug',
  description: 'Users cannot log in',
  priority: TicketPriority.MEDIUM,
  status: TicketStatus.OPEN,
  project: mockProject,
  createdBy: managerEntity,
  assignees: [devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

// QueryBuilder mock for findAllForUser / getTicketCountsByProject
const mockGetManyAndCount = jest.fn();
const mockGetRawMany = jest.fn();
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  setParameter: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  subQuery: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  getQuery: jest.fn().mockReturnValue('(SELECT 1)'),
  getManyAndCount: mockGetManyAndCount,
  getRawMany: mockGetRawMany,
};

const mockTicketRepo = {
  find: jest.fn(),
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

// ─── Module factory ──────────────────────────────────────────────────────────

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

// ─── Tests ───────────────────────────────────────────────────────────────────

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

  // ── findAllForUser ─────────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    const baseQuery: ListTicketsDto = { page: 1, limit: 20 };

    it('should not scope the query for admins', async () => {
      mockGetManyAndCount.mockResolvedValue([[mockTicket], 1]);

      const result = await service.findAllForUser(adminUser, baseQuery);

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        data: [mockTicket],
        total: 1,
        page: 1,
        limit: 20,
        hasNextPage: false,
      });
    });

    it('should scope the query by project membership for managers', async () => {
      mockGetManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAllForUser(managerUser, baseQuery);

      expect(mockQueryBuilder.where).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'userId',
        managerUser.id,
      );
    });

    it('should scope the query by assignee for devs', async () => {
      mockGetManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAllForUser(devUser, baseQuery);

      expect(mockQueryBuilder.where).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'userId',
        devUser.id,
      );
    });

    it('should apply andWhere for the title filter', async () => {
      mockGetManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, { ...baseQuery, title: 'bug' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.title ILIKE :title',
        { title: '%bug%' },
      );
    });

    it('should apply andWhere for the status filter', async () => {
      mockGetManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, {
        ...baseQuery,
        status: TicketStatus.OPEN,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.status = :status',
        { status: TicketStatus.OPEN },
      );
    });

    it('should apply andWhere for the priority filter', async () => {
      mockGetManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, {
        ...baseQuery,
        priority: TicketPriority.HIGH,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.priority = :priority',
        { priority: TicketPriority.HIGH },
      );
    });

    it('should apply andWhere for the projectId filter', async () => {
      mockGetManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, {
        ...baseQuery,
        projectId: mockProject.id,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.project = :projectId',
        { projectId: mockProject.id },
      );
    });

    it('should compute skip correctly (page 2, limit 20 → skip 20)', async () => {
      mockGetManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, { page: 2, limit: 20 });

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    });

    it('should set hasNextPage to true when more pages exist', async () => {
      mockGetManyAndCount.mockResolvedValue([[mockTicket], 25]);

      const result = await service.findAllForUser(adminUser, {
        page: 1,
        limit: 20,
      });

      expect(result.hasNextPage).toBe(true);
    });

    it('should set hasNextPage to false on the last page', async () => {
      mockGetManyAndCount.mockResolvedValue([[mockTicket], 25]);

      const result = await service.findAllForUser(adminUser, {
        page: 2,
        limit: 20,
      });

      expect(result.hasNextPage).toBe(false);
    });
  });

  // ── findOneForUser ─────────────────────────────────────────────────────────

  describe('findOneForUser', () => {
    it('should return the ticket for an admin', async () => {
      mockTicketRepo.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOneForUser(mockTicket.id, adminUser);

      expect(result).toEqual(mockTicket);
      expect(mockProjectRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return the ticket for a project member', async () => {
      mockTicketRepo.findOne.mockResolvedValue(mockTicket);
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      const result = await service.findOneForUser(mockTicket.id, managerUser);

      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException when the ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOneForUser('missing-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when the requesting user is not a project member', async () => {
      mockTicketRepo.findOne.mockResolvedValue(mockTicket);
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      await expect(
        service.findOneForUser(mockTicket.id, otherDevUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException when the ticket's project no longer exists", async () => {
      mockTicketRepo.findOne.mockResolvedValue(mockTicket);
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOneForUser(mockTicket.id, managerUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── createTicket ───────────────────────────────────────────────────────────

  describe('createTicket', () => {
    const dto = {
      title: 'New ticket',
      description: 'Desc',
      priority: TicketPriority.LOW,
      projectId: mockProject.id,
    };

    beforeEach(() => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockUserRepo.findOne.mockResolvedValue(managerEntity);
      mockTicketRepo.create.mockImplementation((data: Partial<Ticket>) => ({
        ...data,
      }));
      mockTicketRepo.save.mockImplementation((t) =>
        Promise.resolve({ ...mockTicket, ...t }),
      );
    });

    it('should create the ticket with status OPEN', async () => {
      await service.createTicket(dto, managerUser);

      const calls = mockTicketRepo.create.mock.calls as {
        status: TicketStatus;
      }[][];
      expect(calls[0][0].status).toBe(TicketStatus.OPEN);
    });

    it('should auto-assign the creator as the first assignee', async () => {
      await service.createTicket(dto, managerUser);

      const calls = mockTicketRepo.create.mock.calls as {
        assignees: User[];
      }[][];
      expect(calls[0][0].assignees).toContainEqual(
        expect.objectContaining({ id: managerUser.id }),
      );
    });

    it('should call repo.create before repo.save', async () => {
      const callOrder: string[] = [];
      mockTicketRepo.create.mockImplementation((data: Partial<Ticket>) => {
        callOrder.push('create');
        return data as Ticket;
      });
      mockTicketRepo.save.mockImplementation((t) => {
        callOrder.push('save');
        return Promise.resolve(t);
      });

      await service.createTicket(dto, managerUser);

      expect(callOrder).toEqual(['create', 'save']);
    });

    it('should throw ForbiddenException when a non-admin non-member tries to create a ticket', async () => {
      await expect(service.createTicket(dto, otherDevUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(service.createTicket(dto, managerUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when the requesting user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.createTicket(dto, managerUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── updateTicket ───────────────────────────────────────────────────────────

  describe('updateTicket', () => {
    it('should update and return the ticket', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateTicket(
        mockTicket.id,
        { title: 'Renamed' },
        adminUser,
      );

      expect(result.title).toBe('Renamed');
    });

    it('should throw ForbiddenException for a dev (manager access required)', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      await expect(
        service.updateTicket(mockTicket.id, { title: 'X' }, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reset assignees to the requesting user when moving to a different project', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      // first call: access-check on the ticket's current project
      // second call: access-check on the destination project
      mockProjectRepo.findOne
        .mockResolvedValueOnce(mockProject)
        .mockResolvedValueOnce(otherProject);
      mockUserRepo.findOne.mockResolvedValue(managerEntity);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateTicket(
        mockTicket.id,
        { projectId: otherProject.id },
        managerUser,
      );

      expect(result.assignees).toEqual([managerEntity]);
      expect(result.project).toEqual(otherProject);
    });

    it('should not touch assignees when projectId is unchanged', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateTicket(
        mockTicket.id,
        { projectId: mockProject.id, title: 'Same project' },
        adminUser,
      );

      expect(result.assignees).toEqual(mockTicket.assignees);
    });

    it('should throw NotFoundException when the ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateTicket('missing-id', { title: 'X' }, adminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateTicketStatus ─────────────────────────────────────────────────────

  describe('updateTicketStatus', () => {
    it('should update the status when requested by an admin', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateTicketStatus(
        mockTicket.id,
        { status: TicketStatus.IN_PROGRESS },
        adminUser,
      );

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should allow an assignee dev to update the status', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket }); // assignees: [devEntity]
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.updateTicketStatus(
        mockTicket.id,
        { status: TicketStatus.IN_PROGRESS },
        devUser,
      );

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should throw ForbiddenException when a dev who is not an assignee tries to update the status', async () => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket }); // assignees: [devEntity], not otherDevUser
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      await expect(
        service.updateTicketStatus(
          mockTicket.id,
          { status: TicketStatus.IN_PROGRESS },
          otherDevUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateTicketStatus(
          'missing-id',
          { status: TicketStatus.RESOLVED },
          adminUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── assignUsers ────────────────────────────────────────────────────────────

  describe('assignUsers', () => {
    const dto = { userIds: [managerUser.id, devUser.id] };

    beforeEach(() => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject); // members: [managerEntity, devEntity]
      mockTicketRepo.save.mockImplementation((t) => Promise.resolve(t));
    });

    it('should replace the assignee list with the provided users', async () => {
      mockUserRepo.findBy.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.assignUsers(mockTicket.id, dto, adminUser);

      expect(result.assignees).toHaveLength(2);
    });

    it('should throw NotFoundException when any userId does not exist', async () => {
      mockUserRepo.findBy.mockResolvedValue([managerEntity]);

      await expect(
        service.assignUsers(mockTicket.id, dto, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when a resolved user is not a project member', async () => {
      mockUserRepo.findBy.mockResolvedValue([managerEntity, otherDevEntity]);

      await expect(
        service.assignUsers(
          mockTicket.id,
          { userIds: [managerUser.id, otherDevUser.id] },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for a dev (manager access required)', async () => {
      await expect(
        service.assignUsers(mockTicket.id, dto, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should resolve to an empty assignee list when userIds is empty', async () => {
      const result = await service.assignUsers(
        mockTicket.id,
        { userIds: [] },
        adminUser,
      );

      expect(result.assignees).toEqual([]);
      expect(mockUserRepo.findBy).not.toHaveBeenCalled();
    });
  });

  // ── getAssignableUsers ─────────────────────────────────────────────────────

  describe('getAssignableUsers', () => {
    const emptyQuery: ListAssignableUsersDto = {};

    beforeEach(() => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket }); // assignees: [devEntity]
      mockProjectRepo.findOne.mockResolvedValue(mockProject); // members: [managerEntity, devEntity]
    });

    it('should return project members with isMember flag', async () => {
      const result = await service.getAssignableUsers(
        mockTicket.id,
        adminUser,
        emptyQuery,
      );

      expect(result.every((u) => 'isMember' in u)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should mark ticket assignees with isMember = true', async () => {
      const result = await service.getAssignableUsers(
        mockTicket.id,
        adminUser,
        emptyQuery,
      );

      const dev = result.find((u) => u.id === devUser.id);
      expect(dev?.isMember).toBe(true);
    });

    it('should mark non-assignees with isMember = false', async () => {
      const result = await service.getAssignableUsers(
        mockTicket.id,
        adminUser,
        emptyQuery,
      );

      const manager = result.find((u) => u.id === managerUser.id);
      expect(manager?.isMember).toBe(false);
    });

    it('should filter by fullName (case-insensitive, partial match)', async () => {
      const result = await service.getAssignableUsers(
        mockTicket.id,
        adminUser,
        {
          fullName: 'dev',
        },
      );

      expect(result.map((u) => u.id)).toEqual([devUser.id]);
    });

    it('should filter by role', async () => {
      const result = await service.getAssignableUsers(
        mockTicket.id,
        adminUser,
        {
          role: Role.MANAGER,
        },
      );

      expect(result.map((u) => u.id)).toEqual([managerUser.id]);
    });

    it('should return results sorted by fullName', async () => {
      const result = await service.getAssignableUsers(
        mockTicket.id,
        adminUser,
        emptyQuery,
      );

      const names = result.map((u) => u.fullName);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    it('should throw ForbiddenException for a non-member non-admin', async () => {
      await expect(
        service.getAssignableUsers(mockTicket.id, otherDevUser, emptyQuery),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getAssignableUsers('missing-id', adminUser, emptyQuery),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── deleteTicket ───────────────────────────────────────────────────────────

  describe('deleteTicket', () => {
    beforeEach(() => {
      mockTicketRepo.findOne.mockResolvedValue({ ...mockTicket });
      mockProjectRepo.findOne.mockResolvedValue(mockProject);
    });

    it('should call repo.delete with the ticket id', async () => {
      mockTicketRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteTicket(mockTicket.id, adminUser);

      expect(mockTicketRepo.delete).toHaveBeenCalledWith(mockTicket.id);
    });

    it('should resolve without returning a value on success', async () => {
      mockTicketRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteTicket(mockTicket.id, adminUser);

      expect(result).toBeUndefined();
    });

    it('should throw ForbiddenException for a dev (manager access required)', async () => {
      await expect(
        service.deleteTicket(mockTicket.id, devUser),
      ).rejects.toThrow(ForbiddenException);

      expect(mockTicketRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException for a non-member non-admin', async () => {
      await expect(
        service.deleteTicket(mockTicket.id, otherDevUser),
      ).rejects.toThrow(ForbiddenException);

      expect(mockTicketRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the ticket does not exist', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteTicket('missing-id', adminUser),
      ).rejects.toThrow(NotFoundException);

      expect(mockTicketRepo.delete).not.toHaveBeenCalled();
    });
  });
});
