import { faker } from '@faker-js/faker';
import { TestingModule } from '@nestjs/testing';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { UserCreateType } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';
import { generateHash } from 'src/utils';

export class TestUsers {
  usersRepository: IUsersRepository;

  constructor(testingModule: TestingModule) {
    this.usersRepository = testingModule.get<IUsersRepository>(
      RepositoryProviderKeys.users,
    );
  }

  public async make(pwd?: string) {
    const login = this.generateLogin();
    const email = this.generateEmail();
    const isConfirmed = true;
    const password = pwd ? pwd : this.generatePassword();
    const passwordHash = await generateHash(password);

    const newUser: UserCreateType = {
      login,
      passwordHash: passwordHash,
      email,
      isConfirmed,
    };

    const createdUser = await this.usersRepository.createUser(newUser);

    return createdUser;
  }

  public generatePassword() {
    return faker.internet.password();
  }

  public generateLogin() {
    return `${faker.name.firstName()}_${faker.name.middleName()}`;
  }

  public generateEmail() {
    return faker.internet.email();
  }
}
