import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserIdFromJwt = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new Error('JwtAuthGuard must be used');
    }

    return userId;
  },
);
