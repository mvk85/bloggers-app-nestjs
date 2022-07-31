import { Length } from 'class-validator';
import { IsNotEmptyString } from 'src/decorators/is-not-empty-string.decorator';

export class CommentValidatorModel {
  @IsNotEmptyString()
  @Length(20, 300)
  content: string;
}
