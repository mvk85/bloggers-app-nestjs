import { BloggerExistsById } from '../decorators/blogger-exist.decorator';

export class BloggerParamsValidatorModel {
  @BloggerExistsById()
  id: string;
}
