import { faker } from '@faker-js/faker';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';

export class CreateBloggers {
  constructor(private readonly bloggersRepository: IBloggersRepository) {}

  public async make() {
    const name = this.generateName();
    const youtubeUrl = this.generateUrl();
    const createdBloggerId = await this.bloggersRepository.createBlogger({
      name,
      youtubeUrl,
    });
    const createdBlogger = await this.bloggersRepository.getBloggerById(
      createdBloggerId,
    );

    return createdBlogger;
  }

  public generateName() {
    return faker.name.fullName();
  }

  public generateUrl() {
    return `https://${faker.internet.domainName()}`;
  }
}
