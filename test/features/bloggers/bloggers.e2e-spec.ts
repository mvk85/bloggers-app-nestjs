import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from 'src/const';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { RepositoryProviderKeys } from 'src/types';
import * as request from 'supertest';
import { BAD_IDENTITY, basicAuthHeader } from '../const';
import { UrlBuilder } from '../../helper/UrlBuilder';
import { CreateBloggers } from './helpers/CreateBloggers';
import { HelperBloggers } from './helpers/HelperBloggers';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';
import { configTestApp } from 'test/helper/configApp';

jest.setTimeout(1000 * 100);

describe('bloggers api', () => {
  let app: INestApplication;
  let bloggersRepository: IBloggersRepository;
  let helperBloggers: HelperBloggers;
  let createBloggers: CreateBloggers;
  let urlBuilder: UrlBuilder;
  let commonTestHelper: CommonTestHelper;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    configTestApp(app);
    await app.init();

    bloggersRepository = testingModule.get<IBloggersRepository>(
      RepositoryProviderKeys.bloggers,
    );
    helperBloggers = new HelperBloggers(testingModule);
    createBloggers = new CreateBloggers(bloggersRepository);
    urlBuilder = new UrlBuilder();
    commonTestHelper = new CommonTestHelper();
  });

  beforeEach(async () => {
    await helperBloggers.clear();
    urlBuilder.clear();
  });

  describe('/bloggers', () => {
    it('should return bloggers without pagination and search', async () => {
      const blogger1 = await createBloggers.make();
      const blogger2 = await createBloggers.make();
      const items = [blogger1, blogger2];

      const responseBody = {
        items,
        pagesCount: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalCount: items.length,
        page: DEFAULT_PAGE_NUMBER,
      };
      const apiUrl = urlBuilder.addSubdirectory('bloggers').build();
      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual(responseBody);
      helperBloggers.expectBloggerSchema(response.body.items[0]);
      helperBloggers.expectBloggerSchema(response.body.items[1]);
    });

    // TODO should rewrite on free tests with use AAA (arange, act, assert)
    it('should return bloggers when we use pagination', async () => {
      const blogger1 = await createBloggers.make();
      const blogger2 = await createBloggers.make();
      const pageSize = 1;

      const responseBody1 = {
        items: [blogger1],
        pagesCount: 2,
        pageSize,
        totalCount: 2,
        page: DEFAULT_PAGE_NUMBER,
      };
      const responseBody2 = {
        items: [blogger2],
        pagesCount: 2,
        pageSize,
        totalCount: 2,
        page: 2,
      };
      const responseBody3 = {
        items: [],
        pagesCount: 2,
        pageSize,
        totalCount: 2,
        page: 3,
      };
      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addPagination(1, pageSize)
        .build();

      const response1 = await request(app.getHttpServer()).get(apiUrl);

      expect(response1.status).toEqual(HttpStatus.OK);
      expect(response1.body).toEqual(responseBody1);
      helperBloggers.expectBloggerSchema(response1.body.items[0]);

      urlBuilder.clear();
      const apiUrl2 = urlBuilder
        .addSubdirectory('bloggers')
        .addPagination(2, pageSize)
        .build();

      const response2 = await request(app.getHttpServer()).get(apiUrl2);

      expect(response2.status).toEqual(HttpStatus.OK);
      expect(response2.body).toEqual(responseBody2);
      helperBloggers.expectBloggerSchema(response2.body.items[0]);

      urlBuilder.clear();
      const apiUrl3 = urlBuilder
        .addSubdirectory('bloggers')
        .addPagination(3, pageSize)
        .build();

      const response3 = await request(app.getHttpServer()).get(apiUrl3);

      expect(response3.status).toEqual(HttpStatus.OK);
      expect(response3.body).toEqual(responseBody3);
    });

    it('should return blogger when we use SearchNameTerm', async () => {
      const blogger1 = await createBloggers.make();
      await createBloggers.make();
      const name1 = blogger1.name;

      const responseBody = {
        items: [blogger1],
        pagesCount: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalCount: 1,
        page: DEFAULT_PAGE_NUMBER,
      };
      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addParam('SearchNameTerm', name1)
        .build();

      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual(responseBody);
      helperBloggers.expectBloggerSchema(response.body.items[0]);
    });

    it('should return 401 when try to create and basic auth is not correct', async () => {
      const name = createBloggers.generateName();
      const youtubeUrl = createBloggers.generateUrl();
      const sendObject = {
        name,
        youtubeUrl,
      };
      const apiUrl = urlBuilder.addSubdirectory('bloggers').build();
      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(sendObject);

      expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should create blogger when both data and auth is corrected', async () => {
      const name = createBloggers.generateName();
      const youtubeUrl = createBloggers.generateUrl();
      const sendObject = {
        name,
        youtubeUrl,
      };
      const apiUrl = urlBuilder.addSubdirectory('bloggers').build();
      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(basicAuthHeader)
        .send(sendObject);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.name).toEqual(name);
      expect(response.body.youtubeUrl).toEqual(youtubeUrl);
      helperBloggers.expectBloggerSchema(response.body);
    });

    it('should return 400 when both name and youtubeUrl is not corrected', async () => {
      const name = '1111'; // not correct
      const youtubeUrl = 'http://localhost'; // not correct
      const sendObject = {
        name,
        youtubeUrl,
      };
      const apiUrl = urlBuilder.addSubdirectory('bloggers').build();

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(basicAuthHeader)
        .send(sendObject);
      const errors = response.body.errorsMessages;

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(errors.length).toBe(2);
      commonTestHelper.checkErrors(errors);
    });
  });

  describe('/bloggers/:id', () => {
    it('should return blogger by id when blogger id is correct', async () => {
      const blogger = await createBloggers.make();

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .build();
      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual(blogger);
      helperBloggers.expectBloggerSchema(response.body);
    });

    it('shoult return 404 when blogger id is not correct', async () => {
      const apiUrl = urlBuilder.addSubdirectory(BAD_IDENTITY).build();
      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });

    // TODO add update, delete
  });

  afterAll(() => app.close());
});
