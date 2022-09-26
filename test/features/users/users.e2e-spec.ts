import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { configTestApp } from 'test/helper/configApp';
import { UrlBuilder } from 'test/helper/UrlBuilder';
import { TestUsers } from './helpers/TestUsers';
import { AuthHelper } from 'test/helper/AuthHelper';
import { HelperUsers } from './helpers/HelperUsers';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from 'src/const';

describe('users api e2e tests', () => {
  let app: INestApplication;
  let urlBuilder: UrlBuilder;
  let testUsers: TestUsers;
  let authHelper: AuthHelper;
  let helperUsers: HelperUsers;
  let commonTestHelper: CommonTestHelper;

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
    commonTestHelper = new CommonTestHelper();
  });

  const clear = async () => {
    await helperUsers.clear();
    urlBuilder.clear();
  };

  afterAll(async () => {
    await clear();
    app.close();
  });

  describe('/users GET', () => {
    beforeEach(async () => {
      await clear();
    });
    it('Should return users', async () => {
      const user1 = await testUsers.makePublicUser();
      const user2 = await testUsers.makePublicUser();

      const items = [user1, user2];

      const responseBody = {
        items,
        pagesCount: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalCount: items.length,
        page: DEFAULT_PAGE_NUMBER,
      };
      const apiUrl = urlBuilder.addSubdirectory('users').build();

      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual(responseBody);
      helperUsers.expectUserSchema(response.body.items[0]);
      helperUsers.expectUserSchema(response.body.items[1]);
    });
  });

  describe('/users POST', () => {
    beforeEach(async () => {
      await clear();
    });

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

    it('Should return 400 when data is not correct', async () => {
      const userFields = {
        login: ' ',
        password: ' ',
        email: 'mail@mail',
      };
      const apiUrl = urlBuilder.addSubdirectory('users').build();
      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(userFields);

      const errors = response.body.errorsMessages;

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(errors.length).toBe(3);
      commonTestHelper.checkErrors(errors);
    });
  });

  describe('/users/:userId DELETE', () => {
    beforeEach(async () => {
      await clear();
    });
    it('Should delete user by id when user has a basic auth', async () => {
      const user = await testUsers.make();
      const apiUrl = urlBuilder
        .addSubdirectory('users')
        .addSubdirectory(user.id)
        .build();

      const response = await request(app.getHttpServer())
        .delete(apiUrl)
        .set(authHelper.makeBasicHeader());

      expect(response.status).toEqual(HttpStatus.NO_CONTENT);
    });

    it('Should return 404 when userId is not correct', async () => {
      const apiUrl = urlBuilder
        .addSubdirectory('users')
        .addSubdirectory(commonTestHelper.generateRandomUuid())
        .build();

      const response = await request(app.getHttpServer())
        .delete(apiUrl)
        .set(authHelper.makeBasicHeader());

      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
