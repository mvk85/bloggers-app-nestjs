import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  existConfirmationCodeKey,
  ExistConfirmationCodeRule,
} from './exist-confirmation-code.rule';

export function ExistConfirmationCode(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: existConfirmationCodeKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ExistConfirmationCodeRule,
    });
  };
}
