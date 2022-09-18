import { TestingModule } from '@nestjs/testing';
import { IUsersRepository } from 'src/feature/users/repositories/IUsersRepository';
import { CreatedUserResponse } from 'src/feature/users/types';
import { RepositoryProviderKeys } from 'src/types';

export class HelperUsers {
  userRepository: IUsersRepository;

  constructor(testingModule: TestingModule) {
    this.userRepository = testingModule.get<IUsersRepository>(
      RepositoryProviderKeys.users,
    );
  }

  public async clear() {
    await this.userRepository.deleteAllUsers();
  }

  public expectUserSchema(createdUser: CreatedUserResponse) {
    const userSchema = {
      id: expect.any(String),
      login: expect.any(String),
    };

    expect(createdUser).toEqual(userSchema);
  }
}
