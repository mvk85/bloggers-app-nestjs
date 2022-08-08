import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserIdFromJwt = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.userId;

    return userId;
  },
);
