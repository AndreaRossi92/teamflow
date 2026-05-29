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
import { JwtUser } from '../auth/strategies/jwt.strategy';

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
  createdById: managerUser.id,
  createdBy: managerEntity,
  members: [managerEntity],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

// QueryBuilder mock for findAllForUser (non-admin path)
const mockGetMany = jest.fn();
const mockSetParameter = jest.fn();
const mockWhere = jest.fn();
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockImplementation(() => {
    mockWhere();
    return mockQueryBuilder;
  }),
  setParameter: jest.fn().mockImplementation(() => {
    mockSetParameter();
    return mockQueryBuilder;
  }),
  subQuery: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  getQuery: jest
    .fn()
    .mockReturnValue(
      '(SELECT pm.projectId FROM project_members pm WHERE pm.userId = :userId)',
    ),
  getMany: mockGetMany,
};

const mockProjectRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockUserRepo = {
  findOne: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
};

// ─── Module factory ──────────────────────────────────────────────────────────

async function buildModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      ProjectsService,
      { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
      { provide: getRepositoryToken(User), useValue: mockUserRepo },
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
    it('should call repo.find for admins (no filter)', async () => {
      mockProjectRepo.find.mockResolvedValue([mockProject]);

      const result = await service.findAllForUser(adminUser);

      expect(mockProjectRepo.find).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(result).toEqual([mockProject]);
    });

    it('should use a filtered query for managers', async () => {
      mockGetMany.mockResolvedValue([mockProject]);

      const result = await service.findAllForUser(managerUser);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockProjectRepo.find).not.toHaveBeenCalled();
      expect(result).toEqual([mockProject]);
    });

    it('should use a filtered query for devs', async () => {
      mockGetMany.mockResolvedValue([]);

      await service.findAllForUser(devUser);

      expect(mockProjectRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should scope the query by the requesting user id for non-admins', async () => {
      mockGetMany.mockResolvedValue([]);

      await service.findAllForUser(managerUser);

      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'userId',
        managerUser.id,
      );
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

    it('should set createdById to the requesting user', async () => {
      await service.createProject(dto, managerUser);

      const calls = mockProjectRepo.create.mock.calls as {
        createdById: string;
      }[][];
      expect(calls[0][0].createdById).toBe(managerUser.id);
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
    beforeEach(() => {
      mockProjectRepo.findOne.mockResolvedValue(mockProject); // members: [managerEntity]
    });

    it('should return active non-admin users with isMember flag', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.getAssignableUsers(
        mockProject.id,
        adminUser,
      );

      expect(result.every((u) => 'isMember' in u)).toBe(true);
    });

    it('should mark members with isMember = true', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.getAssignableUsers(
        mockProject.id,
        adminUser,
      );

      const manager = result.find((u) => u.id === managerUser.id);
      expect(manager?.isMember).toBe(true);
    });

    it('should mark non-members with isMember = false', async () => {
      mockUserRepo.find.mockResolvedValue([managerEntity, devEntity]);

      const result = await service.getAssignableUsers(
        mockProject.id,
        adminUser,
      );

      const dev = result.find((u) => u.id === devUser.id);
      expect(dev?.isMember).toBe(false);
    });

    it('should throw ForbiddenException for a non-member non-admin', async () => {
      // devUser is not in mockProject.members
      await expect(
        service.getAssignableUsers(mockProject.id, devUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when the project does not exist', async () => {
      mockProjectRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getAssignableUsers('missing-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
