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
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import { PostsService } from '../posts/posts.service';
import { BloggersService } from './bloggers.service';
import { BloggerParamsValidatorModel } from './validators/blogger-params.validator';
import { BloggerValidatorModel } from './validators/blogger.validator';
import { PostValidatorModel } from './validators/post.validator';

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
  @UseGuards(BasicAuthGuard)
  async createBlogger(@Body() inputBloggerModel: BloggerValidatorModel) {
    const newBlogger = await this.bloggersService.createBlogger(
      inputBloggerModel.name,
      inputBloggerModel.youtubeUrl,
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
  @UseGuards(BasicAuthGuard)
  async updateBloggerById(
    @Param('id') id: string,
    @Body() inputBloggerModel: BloggerValidatorModel,
  ) {
    const isUpdated = await this.bloggersService.updateBloggerById(id, {
      name: inputBloggerModel.name,
      youtubeUrl: inputBloggerModel.youtubeUrl,
    });

    if (!isUpdated) {
      throw new NotFoundException();
    }

    return;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
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
    @Param() params: BloggerParamsValidatorModel,
    @Query('PageNumber') PageNumber?: string,
    @Query('PageSize') PageSize?: string,
  ) {
    const response = await this.bloggersService.getPostsByBloggerId(params.id, {
      PageNumber,
      PageSize,
    });

    return response;
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Param() params: BloggerParamsValidatorModel,
    @Body()
    requestBody: PostValidatorModel,
  ) {
    const bodyFields = {
      title: requestBody.title,
      shortDescription: requestBody.shortDescription,
      content: requestBody.content,
      bloggerId: params.id,
    };

    const newPost = await this.postsService.createPost(bodyFields);

    if (!newPost) {
      throw new BadRequestException();
    }

    return newPost;
  }
}
