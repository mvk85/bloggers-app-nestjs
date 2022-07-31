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
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from 'src/auth/guards/basic-auth.guard';
import { UsersService } from './users.service';
import { UserValidatorModel } from './validators/user.validator';

@Controller('users')
export class UsersController {
  constructor(protected usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query('PageNumber') pageNumber?: string,
    @Query('PageSize') pageSize?: string,
  ) {
    const responseUserObject = await this.usersService.getUsers({
      PageNumber: pageNumber,
      PageSize: pageSize,
    });

    return responseUserObject;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  async createUser(
    @Body()
    { login, password, email }: UserValidatorModel,
  ) {
    const user = await this.usersService.addUser({ login, password, email });

    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUserById(@Param('userId') userId: string) {
    const isDeleted = await this.usersService.deleteUserById(userId);

    if (!isDeleted) {
      throw new NotFoundException();
    }

    return;
  }
}
