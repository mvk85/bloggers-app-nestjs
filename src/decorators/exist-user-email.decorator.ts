import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  existsUserByEmailKey,
  ExistsUserByEmailRule,
} from '../validators/exist-user-email.validator';

export function ExistsUserByEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: existsUserByEmailKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ExistsUserByEmailRule,
    });
  };
}
