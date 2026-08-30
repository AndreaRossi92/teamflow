import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './project.entity';
import { User, Role } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';
import { JwtUser } from '../auth/strategies/jwt.strategy';
import { ListProjectsDto } from './dto/list-projects.dto';
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
  createdBy: managerEntity,
  members: [managerEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const secondProject: Project = {
  id: 'project-uuid-2',
  name: 'TeamFlow Mobile',
  description: 'Mobile app',
  isActive: true,
  createdBy: managerEntity,
  members: [managerEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const thirdProject: Project = {
  id: 'project-uuid-3',
  name: 'TeamFlow Analytics',
  description: 'Analytics dashboard',
  isActive: true,
  createdBy: managerEntity,
  members: [managerEntity, devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const inactiveProject: Project = {
  id: 'project-uuid-4',
  name: 'TeamFlow Legacy',
  description: 'Deprecated',
  isActive: false,
  createdBy: managerEntity,
  members: [devEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

// QueryBuilder mock for findAllForUser (non-admin path)
const mockGetMany = jest.fn();
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
  getQuery: jest
    .fn()
    .mockReturnValue(
      '(SELECT pm.projectId FROM project_members pm WHERE pm.userId = :userId)',
    ),
  getMany: mockGetMany,
  getManyAndCount: jest.fn(), // ← nuovo
};

const mockProjectRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockUserRepo = {
  findOne: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
};

// QueryBuilder mock for the ticket-count aggregates used by getProjectsWorkload
const mockTicketGetRawMany = jest.fn();
const mockTicketQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  getRawMany: mockTicketGetRawMany,
};

const mockTicketRepo = {
  createQueryBuilder: jest.fn(() => mockTicketQueryBuilder),
};

// ─── Module factory ──────────────────────────────────────────────────────────

async function buildModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      ProjectsService,
      { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
      { provide: getRepositoryToken(User), useValue: mockUserRepo },
      { provide: getRepositoryToken(Ticket), useValue: mockTicketRepo },
    ],
  }).compile();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProjectsService', () => {
  let service: ProjectsService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await buildModule();
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(async () => {
    await module.close();
  });

  // ── findAllForUser ─────────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    const baseQuery: ListProjectsDto = { page: 1, limit: 20 };

    it('should call findAndCount for admins and return a paginated result', async () => {
      mockProjectRepo.findAndCount.mockResolvedValue([[mockProject], 1]);

      const result = await service.findAllForUser(adminUser, baseQuery);

      expect(mockProjectRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        data: [mockProject],
        total: 1,
        page: 1,
        limit: 20,
        hasNextPage: false,
      });
    });

    it('should use a query builder for managers and return a paginated result', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProject], 1]);

      const result = await service.findAllForUser(managerUser, baseQuery);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.findAndCount).not.toHaveBeenCalled();
      expect(result).toMatchObject({ data: [mockProject], total: 1, page: 1 });
    });

    it('should use a query builder for devs', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(devUser, baseQuery);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should pass the name filter via ILIKE for admins', async () => {
      mockProjectRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, { ...baseQuery, name: 'flow' });

      const calls = mockProjectRepo.findAndCount.mock.calls as {
        where: { name?: unknown; isActive?: unknown };
      }[][];
      expect(calls[0][0].where.name).toMatchObject({
        _type: 'ilike',
        _value: '%flow%',
      });
    });

    it('should pass the isActive filter for admins', async () => {
      mockProjectRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, {
        ...baseQuery,
        isActive: false,
      });

      const calls = mockProjectRepo.findAndCount.mock.calls as {
        where: { name?: unknown; isActive?: unknown };
      }[][];
      expect(calls[0][0].where.isActive).toBe(false);
    });

    it('should apply andWhere for name filter for non-admins', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(managerUser, { ...baseQuery, name: 'flow' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'project.name ILIKE :name',
        { name: '%flow%' },
      );
    });

    it('should apply andWhere for isActive filter for non-admins', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(managerUser, {
        ...baseQuery,
        isActive: true,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'project.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should scope the query by the requesting user id for non-admins', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(managerUser, baseQuery);

      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'userId',
        managerUser.id,
      );
    });

    it('should compute skip correctly (page 2, limit 20 → skip 20)', async () => {
      mockProjectRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAllForUser(adminUser, { page: 2, limit: 20 });

      expect(mockProjectRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 }),
      );
    });

    it('should set hasNextPage to true when more pages exist', async () => {
      // page 1, limit 20, total 25 → hasNextPage true
      mockProjectRepo.findAndCount.mockResolvedValue([[mockProject], 25]);

      const result = await service.findAllForUser(adminUser, {
        page: 1,
        limit: 20,
      });

      expect(result.hasNextPage).toBe(true);
    });

    it('should set hasNextPage to false on the last page', async () => {
      // page 2, limit 20, total 25 → hasNextPage false
      mockProjectRepo.findAndCount.mockResolvedValue([[mockProject], 25]);

      const result = await service.findAllForUser(adminUser, {
        page: 2,
        limit: 20,
      });

      expect(result.hasNextPage).toBe(false);
    });
  });

  // ── getProjectsWorkload ────────────────────────────────────────────────────

  describe('getProjectsWorkload', () => {
    it('should fetch all projects via repo.find (no pagination) for admins', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getProjectsWorkload(adminUser);

      expect(mockProjectRepo.find).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.findAndCount).not.toHaveBeenCalled();
      const calls = mockProjectRepo.find.mock.calls as {
        take?: unknown;
        skip?: unknown;
      }[][];
      expect(calls[0][0].take).toBeUndefined();
      expect(calls[0][0].skip).toBeUndefined();
    });

    it('should use a query builder .getMany() (no pagination) for non-admins', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getProjectsWorkload(managerUser);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.getMany).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.take).not.toHaveBeenCalled();
      expect(mockQueryBuilder.skip).not.toHaveBeenCalled();
    });

    it('should run a single grouped ticket query', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getProjectsWorkload(adminUser);

      expect(mockTicketRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockTicketQueryBuilder.groupBy).toHaveBeenCalledWith(
        'ticket.project',
      );
      expect(mockTicketQueryBuilder.addGroupBy).toHaveBeenCalledWith(
        'ticket.status',
      );
      expect(mockTicketQueryBuilder.addGroupBy).toHaveBeenCalledWith(
        'ticket.priority',
      );
    });

    it('should build ticketBreakdown with per-status priority counts', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([
        {
          projectId: mockProject.id,
          status: 'open',
          priority: 'high',
          count: '1',
        },
        {
          projectId: mockProject.id,
          status: 'closed',
          priority: 'low',
          count: '10',
        },
        {
          projectId: mockProject.id,
          status: 'resolved',
          priority: 'medium',
          count: '2',
        },
      ]);

      const result = await service.getProjectsWorkload(adminUser);

      expect(result[0].ticketBreakdown).toEqual({
        open: { high: 1, medium: 0, low: 0 },
        inProgress: { high: 0, medium: 0, low: 0 },
        resolved: { high: 0, medium: 2, low: 0 },
        closed: { high: 0, medium: 0, low: 10 },
      });
    });

    it('should default the breakdown and totals to zero for a project with no tickets', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      const result = await service.getProjectsWorkload(adminUser);

      expect(result[0].ticketBreakdown).toEqual({
        open: { high: 0, medium: 0, low: 0 },
        inProgress: { high: 0, medium: 0, low: 0 },
        resolved: { high: 0, medium: 0, low: 0 },
        closed: { high: 0, medium: 0, low: 0 },
      });
    });

    it('should keep the breakdown isolated per project', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject, secondProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([
        {
          projectId: mockProject.id,
          status: 'open',
          priority: 'high',
          count: '5',
        },
        {
          projectId: secondProject.id,
          status: 'resolved',
          priority: 'low',
          count: '2',
        },
      ]);

      const result = await service.getProjectsWorkload(adminUser);

      const first = result.find((p) => p.id === mockProject.id);
      const second = result.find((p) => p.id === secondProject.id);

      expect(first?.ticketBreakdown.open.high).toBe(5);
      expect(first?.ticketBreakdown.resolved.low).toBe(0);
      expect(second?.ticketBreakdown.resolved.low).toBe(2);
      expect(second?.ticketBreakdown.open.high).toBe(0);
    });

    it('should not query tickets when there are no visible projects', async () => {
      mockProjectRepo.find.mockResolvedValue([]);

      const result = await service.getProjectsWorkload(adminUser);

      expect(mockTicketRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should scope the ticket query to the ids of the visible projects', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getProjectsWorkload(managerUser);

      expect(mockTicketQueryBuilder.where).toHaveBeenCalledWith(
        'ticket.project IN (:...projectIds)',
        { projectIds: [mockProject.id] },
      );
    });

    it('should return every visible project, not just a page of them', async () => {
      const manyProjects = Array.from({ length: 47 }, (_, i) => ({
        ...mockProject,
        id: `project-${i}`,
      }));
      mockProjectRepo.find.mockResolvedValue(manyProjects);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      const result = await service.getProjectsWorkload(adminUser);

      expect(result).toHaveLength(47);
    });
  });

  // ── getMembersWorkload ──────────────────────────────────────────────────────

  describe('getMembersWorkload', () => {
    it('should fetch all projects via repo.find for admins', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getMembersWorkload(adminUser);

      expect(mockProjectRepo.find).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should use a query builder for managers (own projects only)', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getMembersWorkload(managerUser);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.find).not.toHaveBeenCalled();
    });

    it('should use a query builder for devs (own projects only)', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getMembersWorkload(devUser);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate members shared across multiple projects', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject, secondProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      const result = await service.getMembersWorkload(adminUser);

      // managerEntity è membro sia di mockProject che di secondProject
      const managerEntries = result.filter((u) => u.id === managerEntity.id);
      expect(managerEntries).toHaveLength(1);
    });

    it('should return every distinct member across visible projects', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject, thirdProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      const result = await service.getMembersWorkload(adminUser);

      expect(result.map((u) => u.id).sort()).toEqual(
        [managerEntity.id, devEntity.id].sort(),
      );
    });

    it('should strip passwordHash from returned members', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      const result = await service.getMembersWorkload(adminUser);

      expect(result[0]).not.toHaveProperty('passwordHash');
    });

    it('should query tickets joined on assignees', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getMembersWorkload(adminUser);

      expect(mockTicketRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockTicketQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'ticket.assignees',
        'assignee',
      );
      expect(mockTicketQueryBuilder.groupBy).toHaveBeenCalledWith(
        'assignee.id',
      );
      expect(mockTicketQueryBuilder.addGroupBy).toHaveBeenCalledWith(
        'ticket.status',
      );
      expect(mockTicketQueryBuilder.addGroupBy).toHaveBeenCalledWith(
        'ticket.priority',
      );
    });

    it('should scope the ticket query to active project ids and member ids', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      await service.getMembersWorkload(adminUser);

      expect(mockTicketQueryBuilder.where).toHaveBeenCalledWith(
        'ticket.project IN (:...projectIds)',
        { projectIds: [mockProject.id] },
      );
      expect(mockTicketQueryBuilder.andWhere).toHaveBeenCalledWith(
        'assignee.id IN (:...memberIds)',
        { memberIds: [managerEntity.id] },
      );
    });

    it('should exclude inactive projects from the ticket count but keep their members', async () => {
      mockProjectRepo.find.mockResolvedValue([inactiveProject]);

      const result = await service.getMembersWorkload(adminUser);

      // Nessuna query ticket: non ci sono progetti attivi
      expect(mockTicketRepo.createQueryBuilder).not.toHaveBeenCalled();
      // Ma il membro del progetto inattivo compare comunque, con breakdown a zero
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(devEntity.id);
      expect(result[0].ticketBreakdown).toEqual({
        open: { high: 0, medium: 0, low: 0 },
        inProgress: { high: 0, medium: 0, low: 0 },
        resolved: { high: 0, medium: 0, low: 0 },
        closed: { high: 0, medium: 0, low: 0 },
      });
    });

    it('should build ticketBreakdown with per-status priority counts', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([
        {
          userId: managerEntity.id,
          status: 'open',
          priority: 'high',
          count: '3',
        },
        {
          userId: managerEntity.id,
          status: 'closed',
          priority: 'low',
          count: '7',
        },
      ]);

      const result = await service.getMembersWorkload(adminUser);

      expect(result[0].ticketBreakdown).toEqual({
        open: { high: 3, medium: 0, low: 0 },
        inProgress: { high: 0, medium: 0, low: 0 },
        resolved: { high: 0, medium: 0, low: 0 },
        closed: { high: 0, medium: 0, low: 7 },
      });
    });

    it('should default the breakdown to zero for a member with no tickets', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);
      mockTicketGetRawMany.mockResolvedValueOnce([]);

      const result = await service.getMembersWorkload(adminUser);

      expect(result[0].ticketBreakdown).toEqual({
        open: { high: 0, medium: 0, low: 0 },
        inProgress: { high: 0, medium: 0, low: 0 },
        resolved: { high: 0, medium: 0, low: 0 },
        closed: { high: 0, medium: 0, low: 0 },
      });
    });

    it('should keep the breakdown isolated per member', async () => {
      mockProjectRepo.find.mockResolvedValue([thirdProject]); // members: manager + dev
      mockTicketGetRawMany.mockResolvedValueOnce([
        {
          userId: managerEntity.id,
          status: 'open',
          priority: 'high',
          count: '4',
        },
        {
          userId: devEntity.id,
          status: 'resolved',
          priority: 'low',
          count: '1',
        },
      ]);

      const result = await service.getMembersWorkload(adminUser);

      const manager = result.find((u) => u.id === managerEntity.id);
      const dev = result.find((u) => u.id === devEntity.id);

      expect(manager?.ticketBreakdown.open.high).toBe(4);
      expect(manager?.ticketBreakdown.resolved.low).toBe(0);
      expect(dev?.ticketBreakdown.resolved.low).toBe(1);
      expect(dev?.ticketBreakdown.open.high).toBe(0);
    });

    it('should not query tickets when there are no visible projects', async () => {
      mockProjectRepo.find.mockResolvedValue([]);

      const result = await service.getMembersWorkload(adminUser);

      expect(mockTicketRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return an empty array when visible projects have no members', async () => {
      const emptyProject: Project = { ...mockProject, members: [] };
      mockProjectRepo.find.mockResolvedValue([emptyProject]);

      const result = await service.getMembersWorkload(adminUser);

      expect(result).toEqual([]);
      expect(mockTicketRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  // ── createProject ──────────────────────────────────────────────────────────

  describe('createProject', () => {
    const dto = { name: 'New Project', description: 'Desc' };

    beforeEach(() => {
      mockUserRepo.findOne.mockResolvedValue(managerEntity);
      mockProjectRepo.create.mockImplementation((data: Partial<Project>) => {
        return { ...data } as Project;
      });
      mockProjectRepo.save.mockImplementation((p) =>
        Promise.resolve({ ...mockProject, ...p }),
      );
    });

    it('should auto-assign the creator as the first member', async () => {
      await service.createProject(dto, managerUser);

      const calls = mockProjectRepo.create.mock.calls as {
        members: User[];
      }[][];
      expect(calls[0][0].members).toContainEqual(
        expect.objectContaining({ id: managerUser.id }),
      );
    });

    it('should call repo.create before repo.save', async () => {
      const callOrder: string[] = [];
      mockProjectRepo.create.mockImplementation((data: Partial<Project>) => {
        callOrder.push('create');
        return data as Project;
      });
      mockProjectRepo.save.mockImplementation((p) => {
        callOrder.push('save');
        return Promise.resolve(p);
      });

      await service.createProject(dto, managerUser);

      expect(callOrder).toEqual(['create', 'save']);
    });

    it('should throw NotFoundException when the requesting user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.createProject(dto, managerUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findOneForUser ─────────────────────────────────────────────────────────

  describe('findOneForUser', () => {
    it('should return the project when the requesting user is an admin', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        members: [],
      });

      const result = await service.findOneForUser(mockProject.id, adminUser);

      expect(result).toBeDefined();
    });

    it('should return the project when the requesting user is a member', async () => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject); // members: [managerEntity]

      const result = await service.findOneForUser(mockProject.id, managerUser);

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOneForUser('nonexistent-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when a non-admin is not a member', async () => {
      // devEntity is NOT in mockProject.members (only managerEntity is)
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      await expect(
        service.findOneForUser(mockProject.id, devUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── updateProject ──────────────────────────────────────────────────────────

  describe('updateProject', () => {
    it('should update and return the project', async () => {
      const updated = { ...mockProject, name: 'Renamed' };
      mockProjectRepo.findOne.mockResolvedValue({ ...mockProject });
      mockProjectRepo.save.mockResolvedValue(updated);

      const result = await service.updateProject(
        mockProject.id,
        { name: 'Renamed' },
        adminUser,
      );

      expect(result.name).toBe('Renamed');
    });

    it('should throw ForbiddenException for a manager not assigned to the project', async () => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject); // only managerEntity is a member

      await expect(
        service.updateProject(mockProject.id, { name: 'X' }, devUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── assignUsers ────────────────────────────────────────────────────────────

  describe('assignUsers', () => {
    const dto = { userIds: [managerUser.id, devUser.id] };

    beforeEach(() => {
      mockProjectRepo.findOne.mockResolvedValue({ ...mockProject });
      mockProjectRepo.save.mockImplementation((p) => Promise.resolve(p));
    });

    it('should replace the member list with the provided users', async () => {
      mockUserRepo.findBy.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.assignUsers(mockProject.id, dto, adminUser);

      expect(result.members).toHaveLength(2);
    });

    it('should throw NotFoundException when any userId does not exist', async () => {
      // Only 1 user found, but 2 were requested
      mockUserRepo.findBy.mockResolvedValue([managerEntity]);

      await expect(
        service.assignUsers(mockProject.id, dto, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when a non-admin non-member tries to assign', async () => {
      // devUser is not in mockProject.members
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      await expect(
        service.assignUsers(mockProject.id, dto, devUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── deactivateProject ──────────────────────────────────────────────────────

  describe('deactivateProject', () => {
    it('should set isActive to false and save', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: true,
      });
      mockProjectRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.deactivateProject(mockProject.id, adminUser);

      expect(result.isActive).toBe(false);
      expect(mockProjectRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should allow an assigned manager to deactivate', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: true,
      });
      mockProjectRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.deactivateProject(
        mockProject.id,
        managerUser,
      );

      expect(result.isActive).toBe(false);
    });

    it('should throw ForbiddenException for a manager not assigned to the project', async () => {
      // devUser is not in mockProject.members
      mockProjectRepo.findOne.mockResolvedValue(mockProject);

      await expect(
        service.deactivateProject(mockProject.id, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deactivateProject('missing-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when the project is already inactive', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });

      await expect(
        service.deactivateProject(mockProject.id, adminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── reactivateProject ──────────────────────────────────────────────────────

  describe('reactivateProject', () => {
    it('should set isActive to true and save', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
        members: [managerEntity],
      });
      mockProjectRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.reactivateProject(mockProject.id, adminUser);

      expect(result.isActive).toBe(true);
    });

    it('should allow an assigned manager to reactivate', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });
      mockProjectRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.reactivateProject(
        mockProject.id,
        managerUser,
      );

      expect(result.isActive).toBe(true);
    });

    it('should throw ForbiddenException for a manager not assigned to the project', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });

      await expect(
        service.reactivateProject(mockProject.id, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.reactivateProject('missing-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when the project is already active', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: true,
      });

      await expect(
        service.reactivateProject(mockProject.id, adminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── getAssignableUsers ─────────────────────────────────────────────────────

  describe('getAssignableUsers', () => {
    const emptyQuery: ListAssignableUsersDto = {};

    beforeEach(() => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject); // members: [managerEntity]
    });

    it('should return active users with isMember flag', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.getAssignableUsers(
        mockProject.id,
        adminUser,
        emptyQuery,
      );

      expect(result.every((u) => 'isMember' in u)).toBe(true);
    });

    it('should mark members with isMember = true', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.getAssignableUsers(
        mockProject.id,
        adminUser,
        emptyQuery,
      );

      const manager = result.find((u) => u.id === managerUser.id);
      expect(manager?.isMember).toBe(true);
    });

    it('should mark non-members with isMember = false', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.getAssignableUsers(
        mockProject.id,
        adminUser,
        emptyQuery,
      );

      const dev = result.find((u) => u.id === devUser.id);
      expect(dev?.isMember).toBe(false);
    });

    it('should pass the name filter as ILIKE to the user repo', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity]);

      await service.getAssignableUsers(mockProject.id, adminUser, {
        fullName: 'man',
      });

      const calls = mockUserRepo.find.mock.calls as {
        where: { fullName?: unknown };
      }[][];
      expect(calls[0][0].where.fullName).toMatchObject({
        _type: 'ilike',
        _value: '%man%',
      });
    });

    it('should pass the role filter to the user repo', async () => {
      mockUserRepo.find.mockResolvedValue([devEntity]);

      await service.getAssignableUsers(mockProject.id, adminUser, {
        role: Role.DEV,
      });

      const calls = mockUserRepo.find.mock.calls as {
        where: { role?: unknown };
      }[][];
      expect(calls[0][0].where.role).toBe(Role.DEV);
    });

    it('should throw ForbiddenException for a non-member non-admin', async () => {
      // devUser is not in mockProject.members
      await expect(
        service.getAssignableUsers(mockProject.id, devUser, emptyQuery),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getAssignableUsers('missing-id', adminUser, emptyQuery),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── deleteProject ──────────────────────────────────────────────────────────

  describe('deleteProject', () => {
    it('should call repo.delete with the project id when the project is inactive', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });
      mockProjectRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteProject(mockProject.id, adminUser);

      expect(mockProjectRepo.delete).toHaveBeenCalledWith(mockProject.id);
    });

    it('should resolve without returning a value on success', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });
      mockProjectRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteProject(mockProject.id, adminUser);

      expect(result).toBeUndefined();
    });

    it('should throw BadRequestException when the project is still active', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: true,
      });

      await expect(
        service.deleteProject(mockProject.id, adminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not call repo.delete when the project is still active', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: true,
      });

      await expect(
        service.deleteProject(mockProject.id, adminUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockProjectRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteProject('nonexistent-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not call repo.delete when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteProject('nonexistent-id', adminUser),
      ).rejects.toThrow(NotFoundException);

      expect(mockProjectRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when a non-member non-admin tries to delete', async () => {
      // devUser is not in mockProject.members
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });

      await expect(
        service.deleteProject(mockProject.id, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should not call repo.delete when access is denied', async () => {
      mockProjectRepo.findOne.mockResolvedValue({
        ...mockProject,
        isActive: false,
      });

      await expect(
        service.deleteProject(mockProject.id, devUser),
      ).rejects.toThrow(ForbiddenException);

      expect(mockProjectRepo.delete).not.toHaveBeenCalled();
    });
  });
});
