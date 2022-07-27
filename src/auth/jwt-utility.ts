import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { configEnvKeys } from 'src/config/consts';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class JwtUtility {
  private jwtAccessSecret: string;

  private jwtRefreshSecret: string;

  private accessTokenExpired: string;

  private refreshTokenExpired: string;

  constructor(private appConfigService: AppConfigService) {
    this.jwtAccessSecret = this.appConfigService.getEnv(
      configEnvKeys.jwtAccessSecret,
    ) as string;
    this.jwtRefreshSecret = this.appConfigService.getEnv(
      configEnvKeys.jwtRefreshSecret,
    ) as string;
    this.accessTokenExpired = this.appConfigService.getEnv(
      configEnvKeys.accessTokenExpired,
    ) as string;
    this.refreshTokenExpired = this.appConfigService.getEnv(
      configEnvKeys.refreshTokenExpired,
    ) as string;
  }

  createJWTTokens(userId: string) {
    return {
      access: this.createJWTAccessToken(userId),
      refresh: this.createJWTRefreshToken(userId),
    };
  }

  createJWTAccessToken(userId: string) {
    return this.createJWTToken(
      userId,
      this.accessTokenExpired,
      this.jwtAccessSecret,
    );
  }

  createJWTRefreshToken(userId: string) {
    return this.createJWTToken(
      userId,
      this.refreshTokenExpired,
      this.jwtRefreshSecret,
    );
  }

  createJWTToken(userId: string, expired: string, jwtSecretKey: string) {
    const payload = { userId };
    const options: SignOptions = {
      expiresIn: expired,
    };

    const jwtToken = jwt.sign(payload, jwtSecretKey, options);

    return jwtToken;
  }

  getUserIdByToken(token: string, isRefreshToken?: boolean) {
    try {
      const secretOrPublicKey = isRefreshToken
        ? this.jwtRefreshSecret
        : this.jwtAccessSecret;
      const result: any = jwt.verify(token, secretOrPublicKey);

      return result.userId;
    } catch (error) {
      return null;
    }
  }

  checkRefreshToken(token: string): boolean {
    try {
      jwt.verify(token, this.jwtRefreshSecret);

      return true;
    } catch (_) {
      return false;
    }
  }
}
