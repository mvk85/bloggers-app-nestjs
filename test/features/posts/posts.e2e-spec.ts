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
import { PostCreateFields } from 'src/feature/posts/types';
import { TestUsers } from '../users/helpers/TestUsers';
import { LikesStatus } from 'src/db/types';

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
  let testUsers: TestUsers;

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
    testUsers = new TestUsers(testingModule);
    commonTestHelper = new CommonTestHelper();
  });

  const clear = async () => {
    await helperPosts.clear();
    urlBuilder.clear();
  };

  afterAll(async () => {
    await clear();
    app.close();
  });

  describe('posts api', () => {
    describe('/post GET', () => {
      beforeEach(async () => {
        await clear();
      });
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
    });
    describe('/post POST', () => {
      beforeEach(async () => {
        await clear();
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
    describe('/post/:id GET', () => {
      beforeEach(async () => {
        await clear();
      });
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

    describe('/post/:id PUT', () => {
      beforeEach(async () => {
        await clear();
      });
      it('Should update post when fields are correct and exist basic auth', async () => {
        const { post } = await testPosts.make();
        const updateObject: PostCreateFields = {
          bloggerId: post.bloggerId,
          content: testPosts.generateContent(),
          title: testPosts.generateTitle(),
          shortDescription: testPosts.generateShortDescription(),
        };
        const apiUrlUpdating = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();
        urlBuilder.clear();
        const apiUrlReceiving = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();

        const responseUpdating = await request(app.getHttpServer())
          .put(apiUrlUpdating)
          .set(authHelper.makeBasicHeader())
          .send(updateObject);

        const responseReceiving = await request(app.getHttpServer()).get(
          apiUrlReceiving,
        );

        expect(responseUpdating.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseReceiving.status).toEqual(HttpStatus.OK);
        expect(responseReceiving.body.content).toEqual(updateObject.content);
        expect(responseReceiving.body.title).toEqual(updateObject.title);
        expect(responseReceiving.body.shortDescription).toEqual(
          updateObject.shortDescription,
        );
        helperPosts.expectPostSchema(responseReceiving.body);
      });

      it('Should return 400 when update field is not correct', async () => {
        const { post } = await testPosts.make();
        const updateObject: PostCreateFields = {
          bloggerId: post.bloggerId,
          content: ' ',
          title: ' ',
          shortDescription: ' ',
        };
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();

        const response = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeBasicHeader())
          .send(updateObject);

        const errors = response.body.errorsMessages;

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(errors.length).toBe(3);
        commonTestHelper.checkErrors(errors);
      });

      it('Should return 401 when does not have a basic auth', async () => {
        const { post } = await testPosts.make();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();

        const response = await request(app.getHttpServer())
          .put(apiUrl)
          .send({});

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
      });

      it('Should return 404 when does not exist postId', async () => {
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(commonTestHelper.generateRandomUuid())
          .build();

        const response = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeBasicHeader())
          .send({});

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    describe('/post/:id DELETE', () => {
      beforeEach(async () => {
        await clear();
      });
      it('Should delete post when postId exist and have basic auth', async () => {
        const { post } = await testPosts.make();
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(post.id)
          .build();

        const responseToDelete = await request(app.getHttpServer())
          .delete(apiUrl)
          .set(authHelper.makeBasicHeader());

        const responseToReceive = await request(app.getHttpServer()).get(
          apiUrl,
        );

        expect(responseToDelete.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseToReceive.status).toEqual(HttpStatus.NOT_FOUND);
      });

      it('Should return 404 when postId does not exist', async () => {
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(commonTestHelper.generateRandomUuid())
          .build();

        const responseToDelete = await request(app.getHttpServer())
          .delete(apiUrl)
          .set(authHelper.makeBasicHeader());

        expect(responseToDelete.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });

    describe('/post/:id/comments POST', () => {
      beforeEach(async () => {
        await clear();
      });
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
      beforeEach(async () => {
        await clear();
      });
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

    describe('/post/:id/like-status PUT', () => {
      let userForLike;
      let postForLike;

      beforeAll(async () => {
        userForLike = await testUsers.make();
        const { post } = await testPosts.make();
        postForLike = post;
      });

      afterAll(async () => {
        await clear();
      });

      beforeEach(() => {
        urlBuilder.clear();
      });

      it('Should create like of post when have auth', async () => {
        const requestBody = { likeStatus: LikesStatus.Like };
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(postForLike.id)
          .addSubdirectory('like-status')
          .build();

        urlBuilder.clear();

        const apiUrlReceiving = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(postForLike.id)
          .build();

        const responseToLike = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeAccessHeader(userForLike.id))
          .send(requestBody);

        const responseToReceive = await request(app.getHttpServer()).get(
          apiUrlReceiving,
        );

        expect(responseToLike.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseToReceive.status).toEqual(HttpStatus.OK);
        expect(responseToReceive.body.extendedLikesInfo.likesCount).toBe(1);
        expect(responseToReceive.body.extendedLikesInfo.dislikesCount).toBe(0);
        expect(
          responseToReceive.body.extendedLikesInfo.newestLikes.length,
        ).toBe(1);
        expect(
          responseToReceive.body.extendedLikesInfo.newestLikes[0].userId,
        ).toBe(userForLike.id);
      });

      it('Should change status of post like when have auth', async () => {
        const requestBody = { likeStatus: LikesStatus.Dislike };
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(postForLike.id)
          .addSubdirectory('like-status')
          .build();

        urlBuilder.clear();

        const apiUrlToReceive = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(postForLike.id)
          .build();

        const responseToLike = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeAccessHeader(userForLike.id))
          .send(requestBody);

        const responseToReceive = await request(app.getHttpServer()).get(
          apiUrlToReceive,
        );

        expect(responseToLike.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseToReceive.status).toEqual(HttpStatus.OK);
        expect(responseToReceive.body.extendedLikesInfo.likesCount).toBe(0);
        expect(responseToReceive.body.extendedLikesInfo.dislikesCount).toBe(1);
        expect(
          responseToReceive.body.extendedLikesInfo.newestLikes.length,
        ).toBe(0);
      });

      it('Should delete like entity of post when have auth', async () => {
        const requestBody = { likeStatus: LikesStatus.None };
        const apiUrl = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(postForLike.id)
          .addSubdirectory('like-status')
          .build();

        urlBuilder.clear();

        const apiUrlToReceive = urlBuilder
          .addSubdirectory('posts')
          .addSubdirectory(postForLike.id)
          .build();

        const responseToLike = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeAccessHeader(userForLike.id))
          .send(requestBody);

        const responseToReceive = await request(app.getHttpServer()).get(
          apiUrlToReceive,
        );

        expect(responseToLike.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseToReceive.status).toEqual(HttpStatus.OK);
        expect(responseToReceive.body.extendedLikesInfo.likesCount).toBe(0);
        expect(responseToReceive.body.extendedLikesInfo.dislikesCount).toBe(0);
        expect(
          responseToReceive.body.extendedLikesInfo.newestLikes.length,
        ).toBe(0);
      });
    });
  });
});
