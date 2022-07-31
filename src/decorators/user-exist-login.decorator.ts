import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  userExistByLoginKey,
  UserExistsByLoginRule,
} from '../validators/user-exist-login.validator';

export function UserExistsByLogin(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: userExistByLoginKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserExistsByLoginRule,
    });
  };
}
