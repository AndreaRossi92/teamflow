import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ErrorCode } from '../app-error.codes';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'fullName'>;
};

const DUMMY_HASH = bcrypt.hashSync('dummy-timing-protection', 10);

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private buildAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    return this.jwtService.sign(payload);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);

    // Always execute bcrypt.compare to avoid timing attacks
    const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(dto.password, hashToCheck);

    if (!user || !user.isActive || !passwordMatch) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const hash = this.hashToken(rawRefreshToken);
    const now = new Date();

    const deleteResult = await this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('tokenHash = :hash AND expiresAt > :now', { hash, now })
      .returning(['userId'])
      .execute();

    if (!deleteResult.affected) {
      // Token not found, already consumed by a concurrent request, or expired
      throw new UnauthorizedException(
        ErrorCode.INVALID_OR_EXPIRED_REFRESH_TOKEN,
      );
    }

    // Safe to cast: RETURNING guarantees the row existed
    const { userId } = (deleteResult.raw as { userId: string }[])[0];

    let user: User;
    try {
      user = await this.usersService.findOne(userId);
    } catch {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    return this.issueTokens(user);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const hash = this.hashToken(rawRefreshToken);
    await this.refreshTokenRepo.delete({ tokenHash: hash });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthTokens> {
    let user: User;
    try {
      user = await this.usersService.findOne(userId);
    } catch {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
    }

    await this.usersService.updatePassword(userId, dto.newPassword);
    await this.refreshTokenRepo.delete({ userId });

    // Re-fetch to get the updated passwordHash reflected in the token
    const updatedUser = await this.usersService.findOne(userId);
    return this.issueTokens(updatedUser);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshTokenRepo.delete({ userId });
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const rawRefreshToken = this.generateRefreshToken();
    const hash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        tokenHash: hash,
        userId: user.id,
        user,
        expiresAt,
      }),
    );

    return {
      accessToken: this.buildAccessToken(user),
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }
}
