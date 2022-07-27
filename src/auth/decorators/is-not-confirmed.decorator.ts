import { registerDecorator, ValidationOptions } from 'class-validator';
import { isNotConfirmedKey, IsNotConfirmedRule } from './is-not-confirmed.rule';

export function IsNotConfirmed(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: isNotConfirmedKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotConfirmedRule,
    });
  };
}
