import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleAsyncOptions } from 'src/auth/jwt-module-options';
import { JwtUtility } from 'src/auth/jwt-utility';
import { BasicStrategy } from 'src/auth/strategies/basic-auth.strategy';
import { InjectUserIdFromJwt } from 'src/guards/inject-user-id-from-jwt';
import { ValidatePostId } from 'src/feature/posts/guards/validate-post-id.guard';
import { NotExistsUserByEmailRule } from 'src/validators/not-exist-user-email.validator';
import { UserExistsByLoginRule } from 'src/validators/user-exist-login.validator';
import { BloggersController } from './bloggers/bloggers.controller';
import { BloggersService } from './bloggers/bloggers.service';
import { BloggerExistsByIdRule } from './bloggers/decorators/blogger-exist.rule';
import { CommentLikesService } from './comments/comment-like.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsService } from './comments/comments.service';
import { CommentExistsByIdRule } from './comments/decorators/comment-exist.rule';
import { CommentCredentialsGuard } from './comments/guards/comment-credentials.guard';
import { CommentsByPostService } from './posts/comments-by-post.service';
import { PostExistsByIdRule } from './posts/decorators/post-exist.rule';
import { CommentsLikesMapper } from './posts/mappers/likes-comment.mapper';
import { PostsLikesMapper } from './posts/mappers/likes-post.mapper';
import { LikesMapper } from './posts/mappers/likes.mapper';
import { PostCreateService } from './posts/post-create.service';
import { PostLikesService } from './posts/post-like.service';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ValidateCommentId } from './comments/guards/validate-comment-id.guard';
import { RepositoriesModule } from './repositories.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync(jwtModuleAsyncOptions),
    RepositoriesModule.forRoot(),
  ],
  controllers: [
    BloggersController,
    CommentsController,
    PostsController,
    UsersController,
  ],
  providers: [
    BloggersService,
    PostsService,
    CommentsService,
    CommentsRepository,
    UsersService,
    BloggerExistsByIdRule,
    PostExistsByIdRule,
    NotExistsUserByEmailRule,
    UserExistsByLoginRule,
    JwtUtility, // TODO убрать (перенести в отдельный модуль или в auth)
    CommentCredentialsGuard,
    CommentExistsByIdRule,
    BasicStrategy,
    PostLikesService,
    PostCreateService,
    CommentsByPostService,
    PostsLikesMapper,
    CommentsLikesMapper,
    CommentLikesService,
    LikesMapper,
    ValidatePostId,
    InjectUserIdFromJwt,
    ValidateCommentId,
  ],
  exports: [
    UsersService, // TODO избавиться от экспорта сервиса
    CommentsRepository,
  ],
})
export class FeatureModule {}
