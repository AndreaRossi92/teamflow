import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = (req.cookies as Record<string, string>)?.refresh_token;

    if (!token) throw new UnauthorizedException('Refresh token missing');

    req.user = token as unknown as Express.User;
    return true;
  }
}
