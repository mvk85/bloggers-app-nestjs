import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  isNotConfirmedByEmailKey,
  IsNotConfirmedByEmailRule,
} from './is-not-confirmed-by-emal.rule';

export function IsNotConfirmedByEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: isNotConfirmedByEmailKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotConfirmedByEmailRule,
    });
  };
}
