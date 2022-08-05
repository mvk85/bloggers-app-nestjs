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
import { CommentValidatorModel } from '../comments/dto/comment.validator';
import { PostIdParamValidatorModel } from './dto/post-params.dto';
import { PostValidatorModel } from './dto/post.dto';
import { CurrentUserIdFromJwt } from 'src/decorators/current-user-id.decorator';
import { UsersRepository } from '../users/users.repository';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import { PostLikeDto } from './dto/post-like.dto';
import { PostLikesService } from './post-like.service';
import { PostCreateService } from './post-create.service';
import { CommentsByPostService } from './comments-by-post.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private usersRepository: UsersRepository,
    private postLikesService: PostLikesService,
    private postCreateService: PostCreateService,
    private commentsByPostService: CommentsByPostService,
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
    const newPost = await this.postCreateService.createPost(bodyFields);

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
    @Param() postParams: PostIdParamValidatorModel,
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
  async deletePostById(@Param() postParams: PostIdParamValidatorModel) {
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
    @Param() postParams: PostIdParamValidatorModel,
    @Body() bodyFields: CommentValidatorModel,
    @CurrentUserIdFromJwt() userId: string,
  ) {
    const userDb = await this.usersRepository.findUserByUserId(userId);
    const newComment = await this.commentsByPostService.createComment({
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
    @Param() postParams: PostIdParamValidatorModel,
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const response = await this.commentsByPostService.getCommentsByPostId(
      postParams.id,
      {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    );

    return response;
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async setLike(
    @Body() likeDto: PostLikeDto,
    @Param() postIdParam: PostIdParamValidatorModel,
    @CurrentUserIdFromJwt() userId: string,
  ) {
    await this.postLikesService.setLike(
      likeDto.likeStatus,
      userId,
      postIdParam.id,
    );
    return;
  }
}
