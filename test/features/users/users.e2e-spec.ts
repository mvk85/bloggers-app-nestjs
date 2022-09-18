import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { configTestApp } from 'test/helper/configApp';
import { UrlBuilder } from 'test/helper/UrlBuilder';
import { TestUsers } from './helpers/TestUsers';
import { AuthHelper } from 'test/helper/AuthHelper';
import { HelperUsers } from './helpers/HelperUsers';

describe('users api e2e tests', () => {
  let app: INestApplication;
  let urlBuilder: UrlBuilder;
  let testUsers: TestUsers;
  let authHelper: AuthHelper;
  let helperUsers: HelperUsers;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    configTestApp(app);
    await app.init();

    urlBuilder = new UrlBuilder();
    testUsers = new TestUsers(testingModule);
    authHelper = new AuthHelper(testingModule);
    helperUsers = new HelperUsers(testingModule);
  });

  const clear = async () => {
    await helperUsers.clear();
    urlBuilder.clear();
  };

  afterAll(async () => {
    await clear();
    app.close();
  });

  describe('/users POST', () => {
    it('Should create user when data is correct', async () => {
      const createObject = testUsers.makeCreatedObject();
      const apiUrl = urlBuilder.addSubdirectory('users').build();

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(createObject);

      expect(response.status).toEqual(HttpStatus.CREATED);
      expect(response.body.login).toEqual(createObject.login);
      helperUsers.expectUserSchema(response.body);
    });
  });
});
