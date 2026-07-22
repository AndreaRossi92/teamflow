import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ErrorCode } from '../../app-error.codes';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = (req.cookies as Record<string, string>)?.refresh_token;

    if (!token)
      throw new UnauthorizedException(ErrorCode.REFRESH_TOKEN_MISSING);

    req.user = token;
    return true;
  }
}
