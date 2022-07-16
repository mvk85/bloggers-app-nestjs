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
} from '@nestjs/common';
import { CommentsService } from './comments.service';

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
  async deleteById(@Param('id') id: string) {
    const isDeleted = await this.commentsService.deleteById(id);

    if (!isDeleted) {
      throw new BadRequestException();
    }

    return;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateById(
    @Param('id') commentId: string,
    @Body('content') content: string,
  ) {
    const isUpdated = await this.commentsService.updateById(commentId, {
      content,
    });

    if (!isUpdated) {
      throw new BadRequestException();
    }

    return;
  }
}
