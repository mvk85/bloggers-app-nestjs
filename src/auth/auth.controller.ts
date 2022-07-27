import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserGuardEntity } from 'src/types';
import { UserByAuth } from 'src/validators/user.decorator';
import { AuthService } from './auth.service';
import { IpCheckerGuard } from './guards/ip-checker.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserSignInValidatorModel } from './validators/user-login.validator';
import { UserValidatorModel } from './validators/user.validator';

@Controller('auth')
export class AuthController {
  private isProduction: boolean;

  constructor(
    protected authService: AuthService,
    private appConfigService: AppConfigService,
  ) {
    this.isProduction = this.appConfigService.getEnv(
      configEnvKeys.isProduction,
    ) as boolean;
  }

  @Post('login')
  @UseGuards(IpCheckerGuard)
  async login(
    @Body() requestBody: UserSignInValidatorModel,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.getUserByCredentials(
      requestBody.login,
      requestBody.password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const tokens = this.authService.createTokensByUserId(user.id);

    this.addRefreshTokenToCookie(response, tokens.refresh);

    return { accessToken: tokens.access };
  }

  private addRefreshTokenToCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      secure: this.isProduction, // true needs for https
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(IpCheckerGuard)
  async registration(@Body() bodyRequest: UserValidatorModel) {
    const isRegistrated = await this.authService.registration(bodyRequest);

    if (!isRegistrated) {
      throw new BadRequestException();
    }

    return;
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(IpCheckerGuard)
  async registrationConfirmation(@Body('code') confirmationCode: string) {
    const isConfirmed = await this.authService.registrationConfirmation(
      confirmationCode,
    );

    if (!isConfirmed) {
      throw new BadRequestException();
    }

    return;
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(IpCheckerGuard)
  async registrationEmailResending(@Body('email') email: string) {
    const isSendedNewCode = await this.authService.registrationEmailResending(
      email,
    );

    if (!isSendedNewCode) {
      throw new BadRequestException();
    }

    return;
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;

    await this.authService.addTokenToBlackList(refreshToken);

    const tokens = this.authService.createTokensByRefreshToken(refreshToken);

    this.addRefreshTokenToCookie(res, tokens.refresh);

    return { accessToken: tokens.access };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async logout(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;

    await this.authService.addTokenToBlackList(refreshToken);

    return;
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async me(@UserByAuth() user: UserGuardEntity) {
    const meData = await this.authService.me(user.userId);

    if (!meData) {
      throw new BadRequestException();
    }

    return meData;
  }
}