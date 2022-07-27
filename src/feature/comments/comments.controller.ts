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
import { AuthGuard } from 'src/guards/auth.guard';
import { CommentsService } from './comments.service';
import { CommentCredentialsGuard } from './guards/comment-credentials.guard';
import { CommentParamsValidatorModel } from './validators/comment-params.validator';
import { CommentValidatorModel } from './validators/comment.validator';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

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
  @UseGuards(AuthGuard, CommentCredentialsGuard) // TODO правильно ли так прокидывать userId
  async deleteById(@Param() params: CommentParamsValidatorModel) {
    const isDeleted = await this.commentsService.deleteById(params.id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
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
}
