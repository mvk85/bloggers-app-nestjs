import { Length } from 'class-validator';
import { BloggerExistsById } from 'src/feature/bloggers/decorators/blogger-exist.decorator';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';

export class PostValidatorModel {
  @IsNotEmptyString()
  @Length(1, 30)
  title: string;

  @IsNotEmptyString()
  @Length(1, 100)
  shortDescription: string;

  @IsNotEmptyString()
  @Length(1, 100)
  content: string;

  @IsNotEmptyString()
  @Length(1, 100)
  @BloggerExistsById()
  bloggerId: string;
}
