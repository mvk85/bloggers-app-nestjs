import { registerDecorator, ValidationOptions } from 'class-validator';
import { bloggerExistKey, BloggerExistsByIdRule } from './blogger-exist.rule';

export function BloggerExistsById(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: bloggerExistKey,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BloggerExistsByIdRule,
    });
  };
}
