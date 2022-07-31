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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CommentValidatorModel } from '../comments/validators/comment.validator';
import { PostParamsValidatorModel } from './validators/post-params.validator';
import { PostValidatorModel } from './validators/post.validator';
import { CurrentUserIdFromJwt } from 'src/decorators/current-user-id.decorator';
import { UsersRepository } from '../users/users.repository';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private usersRepository: UsersRepository,
  ) {}

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
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() bodyFields: PostValidatorModel) {
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
  @UseGuards(BasicAuthGuard)
  async updatePostById(
    @Param() postParams: PostParamsValidatorModel,
    @Body() bodyFields: PostValidatorModel,
  ) {
    const isUpdated = await this.postsService.updatePostById(
      postParams.id,
      bodyFields,
    );

    if (!isUpdated) {
      throw new BadRequestException();
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deletePostById(@Param() postParams: PostParamsValidatorModel) {
    const isDeleted = await this.postsService.deletePostById(postParams.id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param() postParams: PostParamsValidatorModel,
    @Body() bodyFields: CommentValidatorModel,
    @CurrentUserIdFromJwt() userId: string,
  ) {
    const userDb = await this.usersRepository.findUserByUserId(userId);
    const newComment = await this.postsService.createComment({
      content: bodyFields.content,
      userId,
      userLogin: userDb.login,
      postId: postParams.id,
    });

    if (!newComment) {
      throw new BadRequestException();
    }

    return newComment;
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsByPostId(
    @Param() postParams: PostParamsValidatorModel,
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const response = await this.postsService.getCommentsByPostId(
      postParams.id,
      {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    );

    return response;
  }
}
