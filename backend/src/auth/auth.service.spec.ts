import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Not } from 'typeorm';
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
  revoked: false,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  user: mockUser,
  userId: mockUser.id,
  createdAt: new Date(),
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUsersService = {
  findByEmail: jest.fn(),
  findOneBy: jest.fn(),
  updatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockRefreshTokenRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
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

const rawChangePasswordToken = 'current-session-token';
const expectedChangePasswordHash = crypto
  .createHash('sha256')
  .update(rawChangePasswordToken)
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

    beforeEach(() => {
      mockRefreshTokenRepo.create.mockImplementation(
        (data) => data as RefreshToken,
      );
      mockRefreshTokenRepo.save.mockResolvedValue(mockStoredToken);
    });

    it('should issue new tokens on a valid refresh token', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue(mockStoredToken);

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
    });

    it('should revoke the old token before issuing a new one (rotation)', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue({ ...mockStoredToken });

      await service.refresh(rawToken);

      expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ revoked: true }),
      );
    });

    it('should throw when token is not found or already revoked', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when token is expired', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue({
        ...mockStoredToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when the associated user is not active', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue({
        ...mockStoredToken,
        user: { ...mockUser, isActive: false },
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should revoke the refresh token by its hash', async () => {
      mockRefreshTokenRepo.update.mockResolvedValue({});

      await service.logout(rawLogoutToken);

      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { tokenHash: expectedLogoutHash },
        { revoked: true },
      );
    });

    it('should hash the raw token and never store it in plain text', async () => {
      mockRefreshTokenRepo.update.mockResolvedValue({});

      await service.logout(rawLogoutToken);

      expect(mockRefreshTokenRepo.update).not.toHaveBeenCalledWith(
        { tokenHash: rawLogoutToken },
        expect.anything(),
      );
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
      mockRefreshTokenRepo.update.mockResolvedValue({});
      mockUsersService.updatePassword.mockResolvedValue(undefined);
    });

    it('should return new tokens when credentials are valid', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser) // initial lookup
        .mockResolvedValueOnce(mockUser); // post-update lookup
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(mockUser.id, dto, undefined);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
      });
    });

    it('should return a new refreshToken after a successful password change', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.changePassword(mockUser.id, dto, undefined);

      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe('string');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findOneBy.mockResolvedValue(null);

      await expect(
        service.changePassword(mockUser.id, dto, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      mockUsersService.findOneBy.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.changePassword(mockUser.id, dto, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when the current password is wrong', async () => {
      mockUsersService.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, dto, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when updatedUser is not found after password update', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser) // initial lookup succeeds
        .mockResolvedValueOnce(null); // post-update lookup returns nothing
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.changePassword(mockUser.id, dto, undefined),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should revoke all user tokens when no currentRawRefreshToken is provided', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto, undefined);

      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: mockUser.id, revoked: false },
        { revoked: true },
      );
    });

    it('should revoke all OTHER tokens (excluding the current session) when currentRawRefreshToken is provided', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto, rawChangePasswordToken);

      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          revoked: false,
          tokenHash: Not(expectedChangePasswordHash),
        },
        { revoked: true },
      );
    });

    it('should also revoke the current session token after revoking the others', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto, rawChangePasswordToken);

      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { tokenHash: expectedChangePasswordHash },
        { revoked: true },
      );
    });

    it('should hash the current session token and never use it in plain text', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto, rawChangePasswordToken);

      const allCalls = mockRefreshTokenRepo.update.mock.calls;
      const usedRawToken = allCalls.some((args) =>
        JSON.stringify(args).includes(rawChangePasswordToken),
      );
      expect(usedRawToken).toBe(false);
    });

    it('should call updatePassword with the correct userId and new password', async () => {
      mockUsersService.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.changePassword(mockUser.id, dto, undefined);

      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        dto.newPassword,
      );
    });
  });
});
