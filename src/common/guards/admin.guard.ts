import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const adminId = this.config.get<string>('ADMIN_USER_ID');
    if (!adminId || req.user?.id !== adminId) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
