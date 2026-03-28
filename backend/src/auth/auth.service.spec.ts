import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../users/user.entity';

const mockUser: User = {
  id: 'uuid-123',
  email: 'admin@teamflow.com',
  passwordHash: 'hashed-password',
  role: Role.ADMIN,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

async function buildModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    providers: [
      AuthService,
      { provide: UsersService, useValue: mockUsersService },
      { provide: JwtService, useValue: mockJwtService },
    ],
  }).compile();
}

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

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
});
