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
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUserIdFromJwt } from 'src/decorators/current-user-id.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UserSignInValidatorModel } from './dto/user-login.validator';
import { UserValidatorModel } from './dto/user.validator';
import { AppSettingConfig } from 'src/config/configs/app-setting.config';
import { AppConfigProvidersKey } from 'src/config/types';
import { ThrottlerProxyGuard } from 'src/guards/trottle.guard';

@Controller('auth')
export class AuthController {
  private isProduction: boolean;

  constructor(
    protected authService: AuthService,
    @Inject(AppConfigProvidersKey.appConfigSetting)
    private appSettingConfig: AppSettingConfig,
  ) {
    this.isProduction = this.appSettingConfig.isProduction;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard, ThrottlerProxyGuard)
  @HttpCode(HttpStatus.OK)
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
  @UseGuards(ThrottlerProxyGuard)
  async registration(@Body() bodyRequest: UserValidatorModel) {
    const isRegistrated = await this.authService.registration(bodyRequest);

    if (!isRegistrated) {
      throw new BadRequestException();
    }

    return;
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ThrottlerProxyGuard)
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
  @UseGuards(ThrottlerProxyGuard)
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
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUserIdFromJwt() userId: string) {
    const meData = await this.authService.me(userId);

    if (!meData) {
      throw new BadRequestException();
    }

    return meData;
  }
}
