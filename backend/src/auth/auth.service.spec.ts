import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role, User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hashSync: jest.fn().mockReturnValue('dummy-hash'),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockUser: User = {
  id: 'uuid-123',
  email: 'admin@teamflow.com',
  fullName: 'Admin',
  passwordHash: 'hashed-password',
  role: Role.ADMIN,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStoredToken: RefreshToken = {
  id: 'uuid-456',
  tokenHash: 'hashed',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  user: mockUser,
  userId: mockUser.id,
  createdAt: new Date(),
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUsersService = {
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  updatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

// QueryBuilder mock — models the fluent chain used in the atomic DELETE
const mockQbExecute = jest.fn();
const mockQueryBuilder = {
  delete: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  execute: mockQbExecute,
};

const mockRefreshTokenRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

// ─── Module factory ──────────────────────────────────────────────────────────

async function buildModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      AuthService,
      { provide: UsersService, useValue: mockUsersService },
      { provide: JwtService, useValue: mockJwtService },
      {
        provide: getRepositoryToken(RefreshToken),
        useValue: mockRefreshTokenRepo,
      },
    ],
  }).compile();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const rawLogoutToken = 'some-raw-token';
const expectedLogoutHash = crypto
  .createHash('sha256')
  .update(rawLogoutToken)
  .digest('hex');

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await buildModule();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await module.close();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: mockUser.email,
        password: 'admin123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
    });

    it('should also return a refreshToken on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockRefreshTokenRepo.create.mockImplementation(
        (data) => data as RefreshToken,
      );
      mockRefreshTokenRepo.save.mockImplementation((data) =>
        Promise.resolve(data as RefreshToken),
      );

      const result = await service.login({
        email: mockUser.email,
        password: 'admin123',
      });

      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@teamflow.com', password: 'admin123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({ email: mockUser.email, password: 'admin123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return the same error message whether email is missing or password is wrong', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const errorNotFound = await service
        .login({ email: 'ghost@teamflow.com', password: 'admin123' })
        .catch((e: UnauthorizedException) => e);

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const errorWrongPassword = await service
        .login({ email: mockUser.email, password: 'wrong' })
        .catch((e: UnauthorizedException) => e);

      expect((errorNotFound as UnauthorizedException).message).toBe(
        (errorWrongPassword as UnauthorizedException).message,
      );
    });
  });

  // ── refresh ────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    const rawToken = 'valid-raw-token';
    const expectedHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    function mockAtomicDeleteSuccess() {
      mockQbExecute.mockResolvedValue({
        affected: 1,
        raw: [{ userId: mockUser.id }],
      });
    }

    function mockAtomicDeleteMiss() {
      mockQbExecute.mockResolvedValue({ affected: 0, raw: [] });
    }

    beforeEach(() => {
      mockRefreshTokenRepo.create.mockImplementation(
        (data) => data as RefreshToken,
      );
      mockRefreshTokenRepo.save.mockResolvedValue(mockStoredToken);
    });

    it('should issue new tokens on a valid refresh token', async () => {
      mockAtomicDeleteSuccess();
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
    });

    it('should atomically delete the old token during rotation', async () => {
      mockAtomicDeleteSuccess();
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await service.refresh(rawToken);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'tokenHash = :hash AND expiresAt > :now',
        expect.objectContaining({ hash: expectedHash }),
      );
      expect(mockQbExecute).toHaveBeenCalledTimes(1);
    });

    it('should throw when the token is not found or already consumed (affected = 0)', async () => {
      mockAtomicDeleteMiss();

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when token is expired (filtered out by the WHERE clause)', async () => {
      mockAtomicDeleteMiss();

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when the associated user does not exist', async () => {
      mockAtomicDeleteSuccess();
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when the associated user is not active', async () => {
      mockAtomicDeleteSuccess();
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should not call findOne when the atomic delete reports no affected rows', async () => {
      mockAtomicDeleteMiss();

      await service.refresh(rawToken).catch(() => {});

      expect(mockUsersService.findOne).not.toHaveBeenCalled();
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete the refresh token by its hash', async () => {
      mockRefreshTokenRepo.delete.mockResolvedValue({ affected: 1 });

      await service.logout(rawLogoutToken);

      expect(mockRefreshTokenRepo.delete).toHaveBeenCalledWith({
        tokenHash: expectedLogoutHash,
      });
    });

    it('should hash the raw token and never use it in plain text', async () => {
      mockRefreshTokenRepo.delete.mockResolvedValue({ affected: 1 });

      await service.logout(rawLogoutToken);

      expect(mockRefreshTokenRepo.delete).not.toHaveBeenCalledWith({
        tokenHash: rawLogoutToken,
      });
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────────

  describe('changePassword', () => {
    const dto = { currentPassword: 'old-pass', newPassword: 'new-pass' };

    beforeEach(() => {
      mockRefreshTokenRepo.create.mockImplementation(
        (data) => data as RefreshToken,
      );
      mockRefreshTokenRepo.save.mockImplementation((data) =>
        Promise.resolve(data as RefreshToken),
      );
      mockRefreshTokenRepo.delete.mockResolvedValue({ affected: 1 });
      mockUsersService.updatePassword.mockResolvedValue(undefined);
    });

    it('should return new tokens when credentials are valid', async () => {
      mockUsersService.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(mockUser.id, dto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
    });

    it('should return a new refreshToken after a successful password change', async () => {
      mockUsersService.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(mockUser.id, dto);

      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.changePassword(mockUser.id, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.changePassword(mockUser.id, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when the current password is wrong', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(mockUser.id, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should delete all tokens for the user on password change', async () => {
      mockUsersService.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto);

      expect(mockRefreshTokenRepo.delete).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepo.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should call updatePassword with the correct userId and new password', async () => {
      mockUsersService.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto);

      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        dto.newPassword,
      );
    });
  });
});
