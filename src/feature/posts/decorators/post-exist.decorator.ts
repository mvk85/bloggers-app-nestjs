import { registerDecorator, ValidationOptions } from 'class-validator';
import { postExistKey, PostExistsByIdRule } from './post-exist.rule';

export function PostExistsById(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: postExistKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: PostExistsByIdRule,
    });
  };
}
