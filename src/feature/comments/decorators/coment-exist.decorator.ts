import { registerDecorator, ValidationOptions } from 'class-validator';
import { commentExistKey, CommentExistsByIdRule } from './comment-exist.rule';

export function CommentExistsById(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: commentExistKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: CommentExistsByIdRule,
    });
  };
}
