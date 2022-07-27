import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  existsUserByEmailKey,
  ExistsUserByEmailRule,
} from './exist-user-email.rule';

export function ExistsUserByEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: existsUserByEmailKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      // TODO дублируется логика NotExistsUserByEmailRule (разница в инверсии), можно ли переиспользовать?
      validator: ExistsUserByEmailRule,
    });
  };
}
