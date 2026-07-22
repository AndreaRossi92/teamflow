import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, Role } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 'uuid-123',
  email: 'dev@teamflow.com',
  fullName: 'Dev User',
  passwordHash: 'hashed-password',
  role: Role.DEV,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUserRepo = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// ─── Module factory ──────────────────────────────────────────────────────────

async function buildModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      UsersService,
      { provide: getRepositoryToken(User), useValue: mockUserRepo },
    ],
  }).compile();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await buildModule();
    service = module.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await module.close();
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return a paginated result with defaults', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({} as ListUsersDto);

      expect(result).toEqual({
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 20,
        hasNextPage: false,
      });
    });

    it('should apply page and limit to the query', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 3, limit: 10 });

      const [options] = mockUserRepo.findAndCount.mock.calls[0] as [
        { skip: number; take: number },
      ];
      expect(options.skip).toBe(20);
      expect(options.take).toBe(10);
    });

    it('should set hasNextPage to true when more records exist', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[mockUser], 25]);

      const result = await service.findAll({
        page: 1,
        limit: 20,
      });

      expect(result.hasNextPage).toBe(true);
    });

    it('should exclude passwordHash from the select fields', async () => {
      mockUserRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({} as ListUsersDto);

      const [options] = mockUserRepo.findAndCount.mock.calls[0] as [
        { select: Record<string, boolean> },
      ];
      expect(options.select).not.toHaveProperty('passwordHash');
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the user when found', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── findByEmail ────────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('should return the user when the email exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should return null when the email does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('ghost@teamflow.com');

      expect(result).toBeNull();
    });

    it('should query only by email and no other fields', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await service.findByEmail('test@teamflow.com');

      const calls = mockUserRepo.findOne.mock.calls as [
        { where: Record<string, unknown> },
      ][];
      expect(Object.keys(calls[0][0].where)).toEqual(['email']);
    });
  });

  // ── createUser ─────────────────────────────────────────────────────────────

  describe('createUser', () => {
    const dto: CreateUserDto = {
      email: 'manager@teamflow.com',
      fullName: 'Manager',
      password: 'password123',
      role: Role.MANAGER,
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    });

    it('should hash the password with bcrypt before saving', async () => {
      mockUserRepo.create.mockReturnValue({
        ...dto,
        passwordHash: 'hashed-password',
      });
      mockUserRepo.save.mockResolvedValue(mockUser);

      await service.createUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    });

    it('should never persist the plain-text password', async () => {
      mockUserRepo.create.mockImplementation(
        ({ passwordHash }: Partial<User>) => ({ passwordHash }),
      );
      mockUserRepo.save.mockImplementation((u: Partial<User>) =>
        Promise.resolve(u as User),
      );

      await service.createUser(dto);

      const calls = mockUserRepo.save.mock.calls as (Partial<User> & {
        password?: string;
      })[][];
      expect(calls[0][0]).not.toHaveProperty('password');
      expect(calls[0][0].passwordHash).toBe('hashed-password');
    });

    it('should return the saved user', async () => {
      const savedUser: User = {
        ...mockUser,
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
      };
      mockUserRepo.create.mockReturnValue(savedUser);
      mockUserRepo.save.mockResolvedValue(savedUser);

      const result = await service.createUser(dto);

      expect(result).toEqual(savedUser);
    });

    it('should assign the role from the DTO to the new entity', async () => {
      mockUserRepo.create.mockImplementation((data) => data as User);
      mockUserRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      await service.createUser({ ...dto, role: Role.ADMIN });

      const calls = mockUserRepo.create.mock.calls as User[][];
      expect(calls[0][0].role).toBe(Role.ADMIN);
    });

    it('should call repo.create before repo.save', async () => {
      const callOrder: string[] = [];
      mockUserRepo.create.mockImplementation(() => {
        callOrder.push('create');
        return {};
      });
      mockUserRepo.save.mockImplementation((u: unknown) => {
        callOrder.push('save');
        return Promise.resolve(u ?? mockUser);
      });

      await service.createUser(dto);

      expect(callOrder).toEqual(['create', 'save']);
    });

    it('should propagate repository errors (e.g. unique constraint on email)', async () => {
      mockUserRepo.create.mockReturnValue({});
      mockUserRepo.save.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── updateUser ─────────────────────────────────────────────────────────────

  describe('updateUser', () => {
    const dto: UpdateUserDto = { fullName: 'Updated Name' };

    it('should apply the DTO fields and save', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.updateUser(mockUser.id, dto);

      expect(result.fullName).toBe('Updated Name');
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.updateUser('bad-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── deactivateUser ─────────────────────────────────────────────────────────

  describe('deactivateUser', () => {
    it('should set isActive to false and save', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: true });
      mockUserRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.deactivateUser(mockUser.id);

      expect(result.isActive).toBe(false);
    });

    it('should throw BadRequestException when user is already inactive', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.deactivateUser(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.deactivateUser('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── reactivateUser ─────────────────────────────────────────────────────────

  describe('reactivateUser', () => {
    it('should set isActive to true and save', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: false });
      mockUserRepo.save.mockImplementation((u: User) => Promise.resolve(u));

      const result = await service.reactivateUser(mockUser.id);

      expect(result.isActive).toBe(true);
    });

    it('should throw BadRequestException when user is already active', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: true });

      await expect(service.reactivateUser(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.reactivateUser('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── resetUserPassword ──────────────────────────────────────────────────────

  describe('resetUserPassword', () => {
    const newPassword = 'newTemporaryPass1';

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockUserRepo.update.mockResolvedValue({ affected: 1 });
    });

    it('should hash the new password with bcrypt', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await service.resetUserPassword(mockUser.id, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('should persist the hashed password via repo.update', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await service.resetUserPassword(mockUser.id, newPassword);

      expect(mockUserRepo.update).toHaveBeenCalledWith(mockUser.id, {
        passwordHash: 'new-hashed-password',
      });
    });

    it('should never persist the plain-text password', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await service.resetUserPassword(mockUser.id, newPassword);

      const calls = mockUserRepo.update.mock.calls as [
        string,
        Partial<User> & { password?: string },
      ][];
      expect(calls[0][1]).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.resetUserPassword('nonexistent-id', newPassword),
      ).rejects.toThrow(NotFoundException);
    });

    it('should resolve without returning a value on success', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.resetUserPassword(mockUser.id, newPassword);

      expect(result).toBeUndefined();
    });
  });

  // ── deleteUser ─────────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should call repo.delete with the user id when the user is inactive', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: false });
      mockUserRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteUser(mockUser.id);

      expect(mockUserRepo.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should resolve without returning a value on success', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: false });
      mockUserRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteUser(mockUser.id);

      expect(result).toBeUndefined();
    });

    it('should throw BadRequestException when the user is still active', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: true });

      await expect(service.deleteUser(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not call repo.delete when the user is active', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: true });

      await expect(service.deleteUser(mockUser.id)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockUserRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not call repo.delete when the user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteUser('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepo.delete).not.toHaveBeenCalled();
    });
  });
});
