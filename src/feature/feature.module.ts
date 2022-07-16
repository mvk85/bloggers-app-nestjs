import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { BloggersController } from './bloggers/bloggers.controller';
import { BloggersRepository } from './bloggers/bloggers.repository';
import { BloggersService } from './bloggers/bloggers.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsService } from './comments/comments.service';
import { PostsController } from './posts/posts.controller';
import { PostsRepository } from './posts/posts.repository';
import { PostsService } from './posts/posts.service';

@Module({
  imports: [DbModule],
  controllers: [BloggersController, CommentsController, PostsController],
  providers: [
    BloggersService,
    BloggersRepository,
    PostsService,
    PostsRepository,
    CommentsService,
    CommentsRepository,
  ],
})
export class FeatureModule {}
