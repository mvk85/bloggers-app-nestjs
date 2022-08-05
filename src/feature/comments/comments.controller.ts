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

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    private commentLikesService: CommentLikesService,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const comment = await this.commentsService.getById(id);

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
  @UseGuards(JwtAuthGuard)
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
