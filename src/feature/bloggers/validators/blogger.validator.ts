import { IsString, Length, Matches, MaxLength } from 'class-validator';
import { IsNotEmptyString } from 'src/validators/is-not-empty-string';

const regexUrl =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export class BloggerValidatorModel {
  @IsNotEmptyString()
  @IsString()
  @Length(10, 20)
  name: string;

  @IsString()
  @MaxLength(100)
  @Matches(regexUrl)
  youtubeUrl: string;
}
