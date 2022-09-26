import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from 'src/const';
import { IBloggersRepository } from 'src/feature/bloggers/repositories/IBloggersRepository';
import { RepositoryProviderKeys } from 'src/types';
import * as request from 'supertest';
import { BAD_IDENTITY } from '../const';
import { UrlBuilder } from '../../helper/UrlBuilder';
import { TestBloggers } from './helpers/TestBloggers';
import { HelperBloggers } from './helpers/HelperBloggers';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';
import { configTestApp } from 'test/helper/configApp';
import { UpdateBloggerObject } from 'src/feature/bloggers/types';
import { AuthHelper } from 'test/helper/AuthHelper';
import { TestPosts } from '../posts/helpers/TestPosts';
import { HelperPosts } from '../posts/helpers/HelperPosts';

jest.setTimeout(1000 * 100);

describe('bloggers api', () => {
  let app: INestApplication;
  let bloggersRepository: IBloggersRepository;
  let helperBloggers: HelperBloggers;
  let testBloggers: TestBloggers;
  let testPosts: TestPosts;
  let urlBuilder: UrlBuilder;
  let commonTestHelper: CommonTestHelper;
  let authHelper: AuthHelper;
  let helperPosts: HelperPosts;

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
    authHelper = new AuthHelper(testingModule);
    testBloggers = new TestBloggers(bloggersRepository);
    testPosts = new TestPosts(testingModule);
    helperPosts = new HelperPosts(testingModule);
    urlBuilder = new UrlBuilder();
    commonTestHelper = new CommonTestHelper();
  });

  const clear = async () => {
    await helperBloggers.clear();
    urlBuilder.clear();
  };

  beforeEach(async () => {
    await clear();
  });

  describe('/bloggers GET', () => {
    it('should return bloggers without pagination and search', async () => {
      const blogger1 = await testBloggers.make();
      const blogger2 = await testBloggers.make();
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

    it('should return bloggers when we use pagination', async () => {
      const blogger1 = await testBloggers.make();
      const blogger2 = await testBloggers.make();
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

    it('should return bloggers when we use SearchNameTerm', async () => {
      const blogger1 = await testBloggers.make();
      await testBloggers.make();
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
  });

  describe('/bloggers POST', () => {
    it('should return 401 when try to create and basic auth is not correct', async () => {
      const name = testBloggers.generateName();
      const youtubeUrl = testBloggers.generateUrl();
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
      const name = testBloggers.generateName();
      const youtubeUrl = testBloggers.generateUrl();
      const sendObject = {
        name,
        youtubeUrl,
      };
      const apiUrl = urlBuilder.addSubdirectory('bloggers').build();
      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(authHelper.makeBasicHeader())
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
        .set(authHelper.makeBasicHeader())
        .send(sendObject);
      const errors = response.body.errorsMessages;

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(errors.length).toBe(2);
      commonTestHelper.checkErrors(errors);
    });
  });

  describe('/bloggers/:id GET', () => {
    it('should return blogger by id when blogger id is correct', async () => {
      const blogger = await testBloggers.make();

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
  });

  describe('/bloggers/:id PUT', () => {
    it('should update blogger by id when blogger data is correct', async () => {
      const blogger = await testBloggers.make();
      const correctPutObject: UpdateBloggerObject = {
        name: testBloggers.generateName(),
        youtubeUrl: testBloggers.generateUrl(),
      };

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .build();

      const responseUpdate = await request(app.getHttpServer())
        .put(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(correctPutObject);
      const responseGet = await request(app.getHttpServer()).get(apiUrl);

      expect(responseUpdate.status).toEqual(HttpStatus.NO_CONTENT);
      expect(responseGet.status).toEqual(HttpStatus.OK);
      expect(responseGet.body).toEqual({
        id: blogger.id,
        ...correctPutObject,
      });
      helperBloggers.expectBloggerSchema(responseGet.body);
    });
    it('should return 400 when update blogger and data is correct', async () => {
      const blogger = await testBloggers.make();
      const correctPutObject: UpdateBloggerObject = {
        name: '1',
        youtubeUrl: '1',
      };

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .build();

      const responseUpdate = await request(app.getHttpServer())
        .put(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(correctPutObject);

      const errors = responseUpdate.body.errorsMessages;
      expect(responseUpdate.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(errors.length).toBe(2);
      commonTestHelper.checkErrors(errors);
    });
  });

  describe('/bloggers/:id DELETE', () => {
    it('Should delete blogger by id when id exist and it has auth', async () => {
      const blogger = await testBloggers.make();

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .build();

      const responseDelete = await request(app.getHttpServer())
        .delete(apiUrl)
        .set(authHelper.makeBasicHeader());
      const responseGet = await request(app.getHttpServer()).get(apiUrl);

      expect(responseDelete.status).toEqual(HttpStatus.NO_CONTENT);
      expect(responseGet.status).toEqual(HttpStatus.NOT_FOUND);
    });
    it('Should return 404 by delete when blogger by id is not exist', async () => {
      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(commonTestHelper.generateRandomUuid())
        .build();

      const responseDelete = await request(app.getHttpServer())
        .delete(apiUrl)
        .set(authHelper.makeBasicHeader());

      expect(responseDelete.status).toEqual(HttpStatus.NOT_FOUND);
    });
    it('Should return 401 for blogger delete when basic auth is not exist', async () => {
      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(commonTestHelper.generateRandomUuid())
        .build();

      const responseDelete = await request(app.getHttpServer()).delete(apiUrl);

      expect(responseDelete.status).toEqual(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/bloggers/:id/posts GET', () => {
    it('Should return posts by bloggerId when data is correct', async () => {
      const { post, blogger } = await testPosts.make();

      const items = [post];

      const expectedResponseBody = {
        items,
        pagesCount: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalCount: items.length,
        page: DEFAULT_PAGE_NUMBER,
      };
      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .addSubdirectory('posts')
        .build();

      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual(expectedResponseBody);
      helperPosts.expectPostSchema(response.body.items[0]);
    });

    it('Should return 404 for get posts by bloggerId when bloggerId is not correct', async () => {
      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(commonTestHelper.generateRandomUuid())
        .addSubdirectory('posts')
        .build();

      const response = await request(app.getHttpServer()).get(apiUrl);

      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('/bloggers/:id/posts POST', () => {
    it('Should create post by bloggerId when data is correct', async () => {
      const title = testPosts.generateTitle();
      const shortDescription = testPosts.generateShortDescription();
      const content = testPosts.generateContent();

      const blogger = await testBloggers.make();
      const createObject = { title, shortDescription, content };

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .addSubdirectory('posts')
        .build();

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(createObject);

      expect(response.status).toEqual(HttpStatus.CREATED);
      expect(response.body.title).toEqual(title);
      expect(response.body.shortDescription).toEqual(shortDescription);
      expect(response.body.content).toEqual(content);
      expect(response.body.bloggerId).toEqual(blogger.id);
      expect(response.body.bloggerName).toEqual(blogger.name);
      helperPosts.expectPostSchema(response.body);
    });

    it('Should return 404 for create post by bloggerId when bloggerId is not correct', async () => {
      const title = testPosts.generateTitle();
      const shortDescription = testPosts.generateShortDescription();
      const content = testPosts.generateContent();
      const createObject = { title, shortDescription, content };

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(commonTestHelper.generateRandomUuid())
        .addSubdirectory('posts')
        .build();

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(createObject);

      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });
    it('Should return 400 for create post by bloggerId when created data is not correct', async () => {
      const title = ' ';
      const shortDescription = ' ';
      const content = 1;
      const createObject = { title, shortDescription, content };

      const blogger = await testBloggers.make();

      const apiUrl = urlBuilder
        .addSubdirectory('bloggers')
        .addSubdirectory(blogger.id)
        .addSubdirectory('posts')
        .build();

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .set(authHelper.makeBasicHeader())
        .send(createObject);

      const errors = response.body.errorsMessages;

      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(errors.length).toBe(3);
      commonTestHelper.checkErrors(errors);
    });
  });

  afterAll(async () => {
    await clear();
    app.close();
  });
});
