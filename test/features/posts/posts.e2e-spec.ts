import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { UrlBuilder } from 'test/helper/UrlBuilder';
import { CreatePosts } from './helpers/CreatePosts';
import { HelperPosts } from './helpers/HelperPosts';
import { AuthHelper } from 'test/helper/AuthHelper';
import { configTestApp } from 'test/helper/configApp';
import { BAD_IDENTITY } from '../const';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from 'src/const';

jest.setTimeout(1000 * 100);

describe('bloggers api', () => {
  let app: INestApplication;
  let urlBuilder: UrlBuilder;
  let createPosts: CreatePosts;
  let helperPosts: HelperPosts;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    configTestApp(app);
    await app.init();

    urlBuilder = new UrlBuilder();
    createPosts = new CreatePosts(testingModule);
    helperPosts = new HelperPosts(testingModule);
    authHelper = new AuthHelper(testingModule);
  });

  const clear = async () => {
    await helperPosts.clear();
    urlBuilder.clear();
  };

  beforeEach(async () => {
    await clear();
  });

  describe('posts api', () => {
    describe('post', () => {
      it('should return posts without pagination params', async () => {
        const { post: post1 } = await createPosts.make();
        const { post: post2 } = await createPosts.make();
        const { post: post3 } = await createPosts.makeWithLikes({
          notAuth: true,
        });
        const items = [post1, post2, post3];

        const responseBody = {
          items,
          pagesCount: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalCount: items.length,
          page: DEFAULT_PAGE_NUMBER,
        };
        const apiUrl = urlBuilder.addSubdirectory('posts').build();
        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(responseBody);
        helperPosts.expectPostSchema(response.body.items[0]);
        helperPosts.expectPostSchema(response.body.items[1]);
        helperPosts.expectPostSchema(response.body.items[2]);
      });
    });
    describe('/post/:id', () => {
      it('should return post by id when post exist (without likes)', async () => {
        const { post } = await createPosts.make();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();
        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(post);
        helperPosts.expectPostSchema(response.body);
      });

      it('should return post by id when post exist and was set jwt (with likes)', async () => {
        // arrange
        const { post, user } = await createPosts.makeWithLikes();
        const refreshCookie = authHelper.makeRefreshCookie(user.id);
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();

        // act
        const response = await request(app.getHttpServer())
          .get(apiUrl)
          .set('Cookie', [refreshCookie])
          .send();

        // assert
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(post);
        helperPosts.expectPostSchema(response.body);
      });

      it('Shoutd return 404 when post is not exist', async () => {
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(BAD_IDENTITY)
          .build();
        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      });

      // TODO must create the negative tests! (errors, didn't find, etc)
    });

    // TODO подумать про тесты самих лайков
  });

  afterAll(async () => {
    await clear();
    app.close();
  });
});
