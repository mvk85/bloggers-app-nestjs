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

jest.setTimeout(1000 * 100);

describe('comments api e2e tests', () => {
  let app: INestApplication;
  let urlBuilder: UrlBuilder;
  let authHelper: AuthHelper;
  let testComments: TestComments;
  let helperComment: HelperComment;

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
  });
  const clear = async () => {
    await helperComment.clear();
    urlBuilder.clear();
  };

  beforeEach(async () => {
    await clear();
  });
  describe('comments api', () => {
    describe('/comments', () => {
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
    });
  });

  afterAll(async () => {
    await clear();
    app.close();
  });
});
