import { Module } from '@nestjs/common';
import { JwtUtility } from 'src/auth/jwt-utility';
import { AdminBasicAuthGuard } from 'src/guards/admin-basic-auth.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotExistsUserByEmailRule } from 'src/validators/not-exist-user-email.rule';
import { UserExistsByLoginRule } from 'src/validators/user-exist-login.rule';
import { BloggersController } from './bloggers/bloggers.controller';
import { BloggersRepository } from './bloggers/bloggers.repository';
import { BloggersService } from './bloggers/bloggers.service';
import { BloggerExistsByIdRule } from './bloggers/decorators/blogger-exist.rule';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsService } from './comments/comments.service';
import { CommentExistsByIdRule } from './comments/decorators/comment-exist.rule';
import { CommentCredentialsGuard } from './comments/guards/comment-credentials.guard';
import { PostExistsByIdRule } from './posts/decorators/post-exist.rule';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';
import { PostsService } from './posts/posts.service';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { UsersService } from './users/users.service';

@Module({
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
    AuthGuard,
    JwtUtility, // TODO нормально ли так подключать напрямую в несколько мест
    // JwtUtility нужен для AuthGuard в этом модуле
    AdminBasicAuthGuard,
    CommentCredentialsGuard,
    CommentExistsByIdRule,
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
