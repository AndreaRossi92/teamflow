import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, Role } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock the base class so its constructor never runs and never touches
// repo.connection — the only reason unit tests for UsersService would crash.
jest.mock('@dataui/crud-typeorm', () => ({
  TypeOrmCrudService: class {
    protected repo: unknown;
    constructor(repo: unknown) {
      this.repo = repo;
    }
  },
}));

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
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
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
      // Simulate what TypeORM does: create() maps only @Column fields,
      // so the returned entity has passwordHash but not the raw password field.
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
});
