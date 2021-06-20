import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: any, ctx: GqlExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx).getContext();
    const { user } = gqlCtx;
    return user;
  },
);
