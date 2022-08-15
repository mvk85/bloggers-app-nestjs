import { BadRequestException } from '@nestjs/common';

export const validationPipeOption = {
  stopAtFirstError: true,
  exceptionFactory: (errors) => {
    const errorsForResponse = [];

    errors.forEach((e) => {
      const constraintsKeys = Object.keys(e.constraints);

      constraintsKeys.forEach((ckey) => {
        errorsForResponse.push({
          field: e.property,
          message: e.constraints[ckey],
        });
      });
    });
    throw new BadRequestException(errorsForResponse);
  },
};
