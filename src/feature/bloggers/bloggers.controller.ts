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
import { PostsService } from '../posts/posts.service';
import { BloggersService } from './bloggers.service';

@Controller('bloggers')
export class BloggersController {
  constructor(
    protected bloggersService: BloggersService,
    protected postsService: PostsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBloggers(
    @Query()
    queryBody: {
      SearchNameTerm?: string;
      PageNumber?: string;
      PageSize: string;
    },
  ) {
    const response = await this.bloggersService.getBloggers(
      { SearchNameTerm: queryBody.SearchNameTerm },
      {
        PageNumber: queryBody.PageNumber,
        PageSize: queryBody.PageSize,
      },
    );

    return response;
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createBlogger(@Body() body: { name: string; youtubeUrl: string }) {
    const newBlogger = await this.bloggersService.createBlogger(
      body.name,
      body.youtubeUrl,
    );

    return newBlogger;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBloggerById(@Param('id') id: string) {
    const blogger = await this.bloggersService.getBloggerById(id);

    if (!blogger) {
      throw new NotFoundException();
    }

    return blogger;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBloggerById(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('youtubeUrl') youtubeUrl?: string,
  ) {
    const isUpdated = await this.bloggersService.updateBloggerById(id, {
      name,
      youtubeUrl,
    });

    if (!isUpdated) {
      throw new NotFoundException();
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBloggerById(@Param('id') id: string) {
    const isDeleted = await this.bloggersService.deleteBloggerById(id);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }

  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsByBloggerId(
    @Param('id') id: string,
    @Query('PageNumber') PageNumber?: string,
    @Query('PageSize') PageSize?: string,
  ) {
    const response = await this.bloggersService.getPostsByBloggerId(id, {
      PageNumber,
      PageSize,
    });

    return response;
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('id') bloggerId: string,
    @Body()
    requestBody: {
      title: string;
      shortDescription: string;
      content: string;
    },
  ) {
    const bodyFields = {
      title: requestBody.title,
      shortDescription: requestBody.shortDescription,
      content: requestBody.content,
      bloggerId,
    };

    const newPost = await this.postsService.createPost(bodyFields);

    if (!newPost) {
      throw new BadRequestException();
    }

    return newPost;
  }
}
