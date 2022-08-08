import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CommentCredentialsGuard } from './guards/comment-credentials.guard';
import { CommentParamsValidatorModel } from './dto/comment-params.validator';
import { CommentValidatorModel } from './dto/comment.validator';
import { CurrentUserIdFromJwt } from 'src/decorators/current-user-id.decorator';
import { CommentLikeDto } from './dto/comment-like.dto';
import { CommentLikesService } from './comment-like.service';
import { ValidateCommentId } from './guards/validate-comment-id.guard';
import { InjectUserIdFromJwt } from 'src/guards/inject-user-id-from-jwt';
import { GetUserIdFromJwt } from 'src/decorators/get-user-id.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    private commentLikesService: CommentLikesService,
  ) {}

  @Get(':id')
  @UseGuards(InjectUserIdFromJwt)
  async getById(@Param('id') id: string, @GetUserIdFromJwt() userId: string) {
    const comment = await this.commentsService.getById(id, userId);

    if (!comment) {
      throw new BadRequestException();
    }

    return comment;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, CommentCredentialsGuard)
  async deleteById(@Param() params: CommentParamsValidatorModel) {
    const isDeleted = await this.commentsService.deleteById(params.id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateById(
    @Param() params: CommentParamsValidatorModel,
    @Body() bodyFields: CommentValidatorModel,
  ) {
    const isUpdated = await this.commentsService.updateById(params.id, {
      content: bodyFields.content,
    });

    if (!isUpdated) {
      throw new BadRequestException();
    }

    return;
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, ValidateCommentId)
  async setLike(
    @Body() likeDto: CommentLikeDto,
    @Param() commentIdParam: CommentParamsValidatorModel,
    @CurrentUserIdFromJwt() userId: string,
  ) {
    await this.commentLikesService.setLike(
      likeDto.likeStatus,
      userId,
      commentIdParam.id,
    );
    return;
  }
}
