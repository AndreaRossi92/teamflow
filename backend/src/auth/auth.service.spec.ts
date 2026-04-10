import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import * as crypto from 'crypto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const mockUser: User = {
  id: 'uuid-123',
  email: 'admin@teamflow.com',
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

const mockUsersService = {
  findByEmail: jest.fn(),
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

const rawLogoutToken = 'some-raw-token';
const expectedLogoutHash = crypto
  .createHash('sha256')
  .update(rawLogoutToken)
  .digest('hex');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await buildModule();
    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return accessToken and user on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'admin@teamflow.com',
        password: 'admin123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'admin@teamflow.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notexisting@teamflow.com',
          password: 'admin123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({
          email: 'admin@teamflow.com',
          password: 'admin123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not reveal whether the email exists or not', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const errorNotFound = await service
        .login({ email: 'notexisting@teamflow.com', password: 'admin123' })
        .catch((e: UnauthorizedException) => e);

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const errorWrongPassword = await service
        .login({ email: 'admin@teamflow.com', password: 'wrong' })
        .catch((e: UnauthorizedException) => e);

      expect((errorNotFound as UnauthorizedException).message).toBe(
        (errorWrongPassword as UnauthorizedException).message,
      );
    });
  });

  describe('refresh', () => {
    const rawToken = 'valid-raw-token';

    it('should issue new tokens on valid refresh token', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue(mockStoredToken);
      mockRefreshTokenRepo.save.mockResolvedValue(mockStoredToken);
      mockRefreshTokenRepo.create.mockImplementation(
        (data) => data as RefreshToken,
      );

      const result = await service.refresh(rawToken);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should revoke the old token on refresh (rotation)', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue({ ...mockStoredToken });
      mockRefreshTokenRepo.save.mockResolvedValue({});
      mockRefreshTokenRepo.create.mockImplementation(
        (data) => data as RefreshToken,
      );

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

    it('should throw when user is not active', async () => {
      mockRefreshTokenRepo.findOne.mockResolvedValue({
        ...mockStoredToken,
        user: { ...mockUser, isActive: false },
      });

      await expect(service.refresh(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      mockRefreshTokenRepo.update.mockResolvedValue({});

      await service.logout('some-raw-token');

      expect(mockRefreshTokenRepo.update).toHaveBeenCalledWith(
        { tokenHash: expectedLogoutHash },
        { revoked: true },
      );
    });

    it('should hash the token before revoking', async () => {
      mockRefreshTokenRepo.update.mockResolvedValue({});

      await service.logout('plain-token');

      expect(mockRefreshTokenRepo.update).not.toHaveBeenCalledWith(
        { tokenHash: rawLogoutToken },
        expect.anything(),
      );
    });
  });
});
