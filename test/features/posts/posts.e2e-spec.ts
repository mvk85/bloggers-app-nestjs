import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { UrlBuilder } from 'test/helper/UrlBuilder';
import { TestPosts } from './helpers/TestPosts';
import { HelperPosts } from './helpers/HelperPosts';
import { AuthHelper } from 'test/helper/AuthHelper';
import { configTestApp } from 'test/helper/configApp';
import { BAD_IDENTITY } from '../const';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from 'src/const';
import { TestComments } from '../comments/helpers/TestComments';
import { HelperComment } from '../comments/helpers/HelperComments';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';

jest.setTimeout(1000 * 100);

describe('posts api e2e tests', () => {
  let app: INestApplication;
  let urlBuilder: UrlBuilder;
  let testPosts: TestPosts;
  let helperPosts: HelperPosts;
  let authHelper: AuthHelper;
  let testComments: TestComments;
  let helperComment: HelperComment;
  let commonTestHelper: CommonTestHelper;

  beforeAll(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = testingModule.createNestApplication();
    configTestApp(app);
    await app.init();

    urlBuilder = new UrlBuilder();
    testPosts = new TestPosts(testingModule);
    helperPosts = new HelperPosts(testingModule);
    authHelper = new AuthHelper(testingModule);
    testComments = new TestComments(testingModule);
    helperComment = new HelperComment(testingModule);
    commonTestHelper = new CommonTestHelper();
  });

  const clear = async () => {
    await helperPosts.clear();
    urlBuilder.clear();
  };

  beforeEach(async () => {
    await clear();
  });

  describe('posts api', () => {
    describe('/post', () => {
      it('should return posts without pagination params', async () => {
        const { post: post1 } = await testPosts.make();
        const { post: post2 } = await testPosts.make();
        const { post: post3 } = await testPosts.makeWithLikes({
          notAuth: true,
        });
        const items = [post1, post2, post3];

        const expectedResponseBody = {
          items,
          pagesCount: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalCount: items.length,
          page: DEFAULT_PAGE_NUMBER,
        };
        const apiUrl = urlBuilder.addSubdirectory('posts').build();

        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(expectedResponseBody);
        helperPosts.expectPostSchema(response.body.items[0]);
        helperPosts.expectPostSchema(response.body.items[1]);
        helperPosts.expectPostSchema(response.body.items[2]);
      });

      it('Should create new post when the data is correct', async () => {
        const postCreateFields = await testPosts.makeCreatedObject();
        const apiUrl = urlBuilder.addSubdirectory('posts').build();

        const response = await request(app.getHttpServer())
          .post(apiUrl)
          .set(authHelper.makeBasicHeader())
          .send(postCreateFields);

        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(response.body.title).toEqual(postCreateFields.title);
        expect(response.body.shortDescription).toEqual(
          postCreateFields.shortDescription,
        );
        expect(response.body.content).toEqual(postCreateFields.content);
        expect(response.body.bloggerId).toEqual(postCreateFields.bloggerId);
        helperPosts.expectPostSchema(response.body);
      });

      // TODO узнать, хорошая ли практика так делать тест!
      it('Should return post after created when the data is correct', async () => {
        const postCreateFields = await testPosts.makeCreatedObject();
        const apiUrlCreated = urlBuilder.addSubdirectory('posts').build();

        const responsePostCreated = await request(app.getHttpServer())
          .post(apiUrlCreated)
          .set(authHelper.makeBasicHeader())
          .send(postCreateFields);

        urlBuilder.clear();

        const apiUrlGetting = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(responsePostCreated.body.id)
          .build();

        const responsePostGetById = await request(app.getHttpServer())
          .get(apiUrlGetting)
          .send(postCreateFields);

        expect(responsePostGetById.status).toEqual(HttpStatus.OK);
        expect(responsePostGetById.body.title).toEqual(postCreateFields.title);
        expect(responsePostGetById.body.shortDescription).toEqual(
          postCreateFields.shortDescription,
        );
        expect(responsePostGetById.body.content).toEqual(
          postCreateFields.content,
        );
        expect(responsePostGetById.body.bloggerId).toEqual(
          postCreateFields.bloggerId,
        );
        helperPosts.expectPostSchema(responsePostCreated.body);
      });
    });
    describe('/post/:id', () => {
      it('should return post by id when post exist (without likes)', async () => {
        const { post } = await testPosts.make();
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
        const { post, user } = await testPosts.makeWithLikes();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();

        // act
        const response = await request(app.getHttpServer())
          .get(apiUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send();

        // assert
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(post);
        helperPosts.expectPostSchema(response.body);
      });

      it('Should return 404 when post is not exist', async () => {
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(BAD_IDENTITY)
          .build();
        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    describe('/post/:id/comments POST', () => {
      it('Should create comment by postId when fields is correct', async () => {
        const { createObject, post, user } =
          await testComments.makeCreatedObject();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .addSubdirectory('comments')
          .build();

        const response = await request(app.getHttpServer())
          .post(apiUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send(createObject);

        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(response.body.content).toEqual(createObject.content);
        expect(response.body.userId).toEqual(user.id);
        expect(response.body.userLogin).toEqual(user.login);
        helperComment.expectCommentSchema(response.body);
      });
      it('Should return 404 when postId is not correct', async () => {
        const { createObject, user } = await testComments.makeCreatedObject();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(BAD_IDENTITY)
          .addSubdirectory('comments')
          .build();

        const response = await request(app.getHttpServer())
          .post(apiUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send(createObject);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      });

      // TODO не понятно как правильно должно работать? (userId в jwt не корректный)
      it('Should return 400 when jwt is not correct', async () => {
        const { createObject, post } = await testComments.makeCreatedObject();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .addSubdirectory('comments')
          .build();

        const response = await request(app.getHttpServer())
          .post(apiUrl)
          .set(authHelper.makeAccessHeader(BAD_IDENTITY))
          .send(createObject);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      });
      it('Should return 400 when content field is not correct', async () => {
        const { createObject, post, user } =
          await testComments.makeCreatedObject();
        createObject.content = ' ';
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .addSubdirectory('comments')
          .build();

        const response = await request(app.getHttpServer())
          .post(apiUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send(createObject);
        const errors = response.body.errorsMessages;

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(errors.length).toBe(1);
        commonTestHelper.checkErrors(errors);
      });
    });

    describe('/post/:id/comments GET', () => {
      it('Should return list of comments by postId without pagination params', async () => {
        const { comment, post } = await testComments.make();
        await testComments.make(); // make comment with another postId
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .addSubdirectory('comments')
          .build();
        const items = [comment];
        const expectedResponseBody = {
          items,
          pagesCount: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalCount: items.length,
          page: DEFAULT_PAGE_NUMBER,
        };

        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(expectedResponseBody);
        helperComment.expectCommentSchema(response.body.items[0]);
      });

      it('Should return 404 for list of comments when postId dont exist', async () => {
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(commonTestHelper.generateRandomUuid())
          .addSubdirectory('comments')
          .build();

        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  afterAll(async () => {
    await clear();
    app.close();
  });
});
