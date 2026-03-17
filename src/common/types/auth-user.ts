/**
 * Class representation of the authenticated user, safe to use as a
 * decorated parameter type (isolatedModules + emitDecoratorMetadata).
 */
export class AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
}
