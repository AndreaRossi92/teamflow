import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtGuard } from './guards/jwt.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtUser } from './strategies/jwt.strategy';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('access_token', accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Rotate access + refresh token pair' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.user as string;
    const { accessToken, refreshToken, user } =
      await this.authService.refresh(rawToken);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke refresh token and clear cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req.cookies as Record<string, string>)?.refresh_token;
    if (token) await this.authService.logout(token);

    res.clearCookie('access_token', COOKIE_BASE);
    res.clearCookie('refresh_token', {
      ...COOKIE_BASE,
      path: '/api/auth',
    });
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Change own password — invalidates all other active sessions',
  })
  async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const currentUser = req.user as JwtUser;

    const { accessToken, refreshToken, user } =
      await this.authService.changePassword(currentUser.id, dto);

    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }
}
