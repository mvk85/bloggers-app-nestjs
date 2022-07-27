import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  notExistsUserByEmailKey,
  NotExistsUserByEmailRule,
} from './not-exist-user-email.rule';

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
