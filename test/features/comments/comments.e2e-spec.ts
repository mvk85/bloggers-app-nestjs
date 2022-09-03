import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { UrlBuilder } from 'test/helper/UrlBuilder';
import { AuthHelper } from 'test/helper/AuthHelper';
import { configTestApp } from 'test/helper/configApp';
import { TestComments } from './helpers/TestComments';
import { HelperComment } from './helpers/HelperComments';
import { LikesStatus } from 'src/db/types';
import { BAD_IDENTITY } from '../const';
import { CommonTestHelper } from 'test/helper/CommonTestHelper';
import { TestUsers } from '../users/helpers/TestUsers';

jest.setTimeout(1000 * 100);

describe('comments api e2e tests', () => {
  let app: INestApplication;
  let urlBuilder: UrlBuilder;
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
    authHelper = new AuthHelper(testingModule);
    testComments = new TestComments(testingModule);
    helperComment = new HelperComment(testingModule);
    testUsers = new TestUsers(testingModule);
    commonTestHelper = new CommonTestHelper();
  });
  const clear = async () => {
    await helperComment.clear();
    urlBuilder.clear();
  };

  beforeEach(async () => {
    await clear();
  });
  describe('comments api', () => {
    describe('/comments/:id', () => {
      it('should return comment by id when user unauthorized', async () => {
        const { comment } = await testComments.make();
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.id).toEqual(comment.id);
        expect(response.body.content).toEqual(comment.content);
        expect(response.body.addedAt).toEqual(
          new Date(comment.addedAt).toISOString(),
        );
        expect(response.body.userId).toEqual(comment.userId);
        expect(response.body.userLogin).toEqual(comment.userLogin);
        expect(response.body.likesInfo.myStatus).toEqual(LikesStatus.None);
        helperComment.expectCommentSchema(response.body);
      });

      it('should return comment by id when user authorized', async () => {
        const { comment, user } = await testComments.makeWithLike();
        const refreshCookie = authHelper.makeRefreshCookie(user.id);
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const response = await request(app.getHttpServer())
          .get(apiUrl)
          .set('Cookie', [refreshCookie]);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.id).toEqual(comment.id);
        expect(response.body.content).toEqual(comment.content);
        expect(response.body.addedAt).toEqual(
          new Date(comment.addedAt).toISOString(),
        );
        expect(response.body.userId).toEqual(comment.userId);
        expect(response.body.userLogin).toEqual(comment.userLogin);
        expect(response.body.likesInfo.myStatus).toEqual(
          comment.likesInfo.myStatus,
        );
        helperComment.expectCommentSchema(response.body);
      });

      it('Should return 400 when comment by id is not exist', async () => {
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(BAD_IDENTITY)
          .build();
        const response = await request(app.getHttpServer()).get(apiUrl);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('Should delete comment by id when user is owner', async () => {
        const { comment, user } = await testComments.make();
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const responseDeleting = await request(app.getHttpServer())
          .delete(apiUrl)
          .set(authHelper.makeAccessHeader(user.id));

        const responseReceivingAfter = await request(app.getHttpServer()).get(
          apiUrl,
        );

        expect(responseDeleting.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseReceivingAfter.status).toEqual(HttpStatus.BAD_REQUEST);
      });

      it('Should return 403 when comment is deleted and user is not owner', async () => {
        const { comment, user2 } = await testComments.makeWithLike();
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const responseDeleting = await request(app.getHttpServer())
          .delete(apiUrl)
          .set(authHelper.makeAccessHeader(user2.id));

        expect(responseDeleting.status).toEqual(HttpStatus.FORBIDDEN);
      });

      it('Should return 401 when comment is deleted and user is unauthorized', async () => {
        const { comment } = await testComments.make();
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const responseDeleting = await request(app.getHttpServer()).delete(
          apiUrl,
        );

        expect(responseDeleting.status).toEqual(HttpStatus.UNAUTHORIZED);
      });

      it('Should update comment when user is owner', async () => {
        const { comment, user } = await testComments.makeWithLike();
        const newCommentContent = testComments.generateContent();
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const responseUpdating = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send({
            content: newCommentContent,
          });

        const responseReceiving = await request(app.getHttpServer())
          .get(apiUrl)
          .set(authHelper.makeAccessHeader(user.id));

        expect(responseUpdating.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseReceiving.status).toEqual(HttpStatus.OK);
        expect(responseReceiving.body.content).toEqual(newCommentContent);
        helperComment.expectCommentSchema(responseReceiving.body);
      });
      it('Should return 403 when comment is updating and user is not owner', async () => {
        const { comment, user2 } = await testComments.makeWithLike();
        const newCommentContent = testComments.generateContent();
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const responseUpdating = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeAccessHeader(user2.id))
          .send({
            content: newCommentContent,
          });

        expect(responseUpdating.status).toEqual(HttpStatus.FORBIDDEN);
      });

      it('Should return 400 when update field is not correct', async () => {
        const { comment, user } = await testComments.makeWithLike();
        const notCorrectContent = '111';
        const apiUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();

        const responseUpdating = await request(app.getHttpServer())
          .put(apiUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send({
            content: notCorrectContent,
          });

        expect(responseUpdating.status).toEqual(HttpStatus.BAD_REQUEST);
        commonTestHelper.checkErrors(responseUpdating.body.errorsMessages);
      });
    });

    describe(':id/like-status', () => {
      it('Should add like to comment when user is authorized', async () => {
        const likeStatus = LikesStatus.Like;
        const { comment, user2 } = await testComments.make();
        const apiLikeUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .addSubdirectory('like-status')
          .build();
        urlBuilder.clear();
        const apiGetUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .build();
        const refreshCookie = authHelper.makeRefreshCookie(user2.id);

        const responseLike = await request(app.getHttpServer())
          .put(apiLikeUrl)
          .set(authHelper.makeAccessHeader(user2.id))
          .send({
            likeStatus,
          });

        const responseGetComment = await request(app.getHttpServer())
          .get(apiGetUrl)
          .set('Cookie', [refreshCookie]);

        expect(responseLike.status).toEqual(HttpStatus.NO_CONTENT);
        expect(responseGetComment.status).toEqual(HttpStatus.OK);
        expect(responseGetComment.body.likesInfo.likesCount).toEqual(1);
        expect(responseGetComment.body.likesInfo.myStatus).toEqual(likeStatus);
        helperComment.expectCommentSchema(responseGetComment.body);
      });

      it('Should return 401 for like-status of comment when user is unauthorized', async () => {
        const likeStatus = LikesStatus.Like;
        const { comment } = await testComments.make();
        const apiLikeUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .addSubdirectory('like-status')
          .build();

        const responseLike = await request(app.getHttpServer())
          .put(apiLikeUrl)
          .send({
            likeStatus,
          });

        expect(responseLike.status).toEqual(HttpStatus.UNAUTHORIZED);
      });

      it('Should return 400 when like-status of comment is not correct for authorized user', async () => {
        const notCorrectLikeStatus = LikesStatus.Like + 1;
        const { comment, user2 } = await testComments.make();
        const apiLikeUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(comment.id)
          .addSubdirectory('like-status')
          .build();

        const responseLike = await request(app.getHttpServer())
          .put(apiLikeUrl)
          .set(authHelper.makeAccessHeader(user2.id))
          .send({
            likeStatus: notCorrectLikeStatus,
          });

        expect(responseLike.status).toEqual(HttpStatus.BAD_REQUEST);
        commonTestHelper.checkErrors(responseLike.body.errorsMessages);
      });
      it('Should return 404 when like-status of comment has not correct commentId param', async () => {
        const likeStatus = LikesStatus.Like;
        const user = await testUsers.make();
        const notCorrectCommentId = commonTestHelper.generateRandomUuid();
        const apiLikeUrl = urlBuilder
          .addSubdirectory('comments')
          .addSubdirectory(notCorrectCommentId)
          .addSubdirectory('like-status')
          .build();

        const responseLike = await request(app.getHttpServer())
          .put(apiLikeUrl)
          .set(authHelper.makeAccessHeader(user.id))
          .send({
            likeStatus: likeStatus,
          });

        expect(responseLike.status).toEqual(HttpStatus.NOT_FOUND);
      });
    });
  });

  afterAll(async () => {
    await clear();
    app.close();
  });
});
