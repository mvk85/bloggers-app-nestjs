import { Length } from 'class-validator';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';

export class CommentValidatorModel {
  @IsNotEmptyString()
  @Length(20, 300)
  content: string;
}
