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
import { ValidatePostId } from 'src/feature/posts/guards/validate-post-id.guard';
import { InjectUserIdFromJwt } from 'src/guards/inject-user-id-from-jwt';
import { GetUserIdFromJwt } from 'src/decorators/get-user-id.decorator';

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
  @UseGuards(InjectUserIdFromJwt)
  async getPosts(
    @GetUserIdFromJwt() userId: string,
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const response = await this.postsService.getPosts(
      {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
      userId,
    );

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
  @UseGuards(InjectUserIdFromJwt)
  async getPostById(
    @Param('id') postId: string,
    @GetUserIdFromJwt() userId: string,
  ) {
    const post = await this.postsService.getPostById(postId, userId);

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
  @UseGuards(InjectUserIdFromJwt)
  async getCommentsByPostId(
    @Param() postParams: PostIdParamValidatorModel,
    @GetUserIdFromJwt() userId: string,
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const response = await this.commentsByPostService.getCommentsByPostId(
      postParams.id,
      {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
      userId,
    );

    return response;
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, ValidatePostId)
  async setLike(
    @Param() postIdParam: PostIdParamValidatorModel, //TODO это срабатывает всегда после @Body() и всегда 400 вместо нужной 404 и сделан для фикс ValidatePostId
    @CurrentUserIdFromJwt() userId: string,
    @Body() likeDto: PostLikeDto,
  ) {
    await this.postLikesService.setLike(
      likeDto.likeStatus,
      userId,
      postIdParam.id,
    );
    return;
  }
}
