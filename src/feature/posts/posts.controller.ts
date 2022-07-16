import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostCreateFields } from './types';

@Controller('posts')
export class PostsController {
  constructor(protected postsService: PostsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const response = await this.postsService.getPosts({
      PageNumber: pageNumber,
      PageSize: pageSize,
    });

    return response;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() bodyFields: PostCreateFields) {
    const newPost = await this.postsService.createPost(bodyFields);

    if (!newPost) {
      throw new BadRequestException();
    }

    return newPost;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param('id') postId: string) {
    const post = await this.postsService.getPostById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('id') postId: string,
    @Body() bodyFields: PostCreateFields,
  ) {
    const isUpdated = await this.postsService.updatePostById(
      postId,
      bodyFields,
    );

    if (!isUpdated) {
      throw new BadRequestException();
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Param('id') postId: string) {
    const isDeleted = await this.postsService.deletePostById(postId);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }

  @Post(':id/comments')
  async createComment() {
    // TODO нужна авторизация и оттуда получение пользователя
    return;
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsByPostId(
    @Param('id') id: string,
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const response = await this.postsService.getCommentsByPostId(id, {
      PageNumber: pageNumber,
      PageSize: pageSize,
    });

    return response;
  }
}
