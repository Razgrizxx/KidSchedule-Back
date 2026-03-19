import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PhoneVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { isVerified?: boolean } }>();
    if (!request.user?.isVerified) {
      throw new ForbiddenException(
        'Phone verification required to access messaging.',
      );
    }
    return true;
  }
}
