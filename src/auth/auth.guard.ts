import { User } from 'src/users/entities/user.entity';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { allowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<allowedRoles[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) return true;

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    if (!user) return false;

    return roles.includes(user.role) || roles.includes('Any');
  }
}
