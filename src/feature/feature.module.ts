import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleAsyncOptions } from 'src/auth/jwt-module-options';
import { JwtUtility } from 'src/auth/jwt-utility';
import { BasicStrategy } from 'src/auth/strategies/basic-auth.strategy';
import { InjectUserIdFromJwt } from 'src/guards/inject-user-id-from-jwt';
import { ValidatePostId } from 'src/guards/validate-post-id.guard';
import { NotExistsUserByEmailRule } from 'src/validators/not-exist-user-email.validator';
import { UserExistsByLoginRule } from 'src/validators/user-exist-login.validator';
import { BloggersController } from './bloggers/bloggers.controller';
import { BloggersRepository } from './bloggers/bloggers.repository';
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
import { CommentsLikesMapper } from './posts/likes-comment.mapper';
import { PostsLikesMapper } from './posts/likes-post.mapper';
import { LikeMapper } from './posts/likes.mapper';
import { PostCreateService } from './posts/post-create.service';
import { PostLikesService } from './posts/post-like.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';
import { PostsService } from './posts/posts.service';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';

@Module({
  imports: [JwtModule.registerAsync(jwtModuleAsyncOptions)],
  controllers: [
    BloggersController,
    CommentsController,
    PostsController,
    UsersController,
  ],
  providers: [
    BloggersService,
    BloggersRepository,
    PostsService,
    PostsRepository,
    CommentsService,
    CommentsRepository,
    UsersService,
    UsersRepository,
    BloggerExistsByIdRule,
    PostExistsByIdRule,
    NotExistsUserByEmailRule,
    UserExistsByLoginRule,
    JwtUtility, // TODO нормально ли так подключать напрямую в несколько мест
    // JwtUtility нужен для AuthGuard в этом модуле
    CommentCredentialsGuard,
    CommentExistsByIdRule,
    BasicStrategy,
    PostLikesService,
    PostCreateService,
    CommentsByPostService,
    PostsLikesMapper,
    CommentsLikesMapper,
    CommentLikesService,
    LikeMapper,
    ValidatePostId,
    InjectUserIdFromJwt,
  ],
  exports: [
    UsersService, // TODO избавиться от экспорта сервиса
    UsersRepository,
    BloggersRepository,
    CommentsRepository,
    PostsRepository,
  ],
})
export class FeatureModule {}
