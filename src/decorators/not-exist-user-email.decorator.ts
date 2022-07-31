import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  notExistsUserByEmailKey,
  NotExistsUserByEmailRule,
} from '../validators/not-exist-user-email.validator';

export function NotExistsUserByEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: notExistsUserByEmailKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: NotExistsUserByEmailRule,
    });
  };
}
