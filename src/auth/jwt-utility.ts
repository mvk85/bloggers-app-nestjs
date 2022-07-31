import { Injectable } from '@nestjs/common';
import { configEnvKeys } from 'src/config/consts';
import { AppConfigService } from 'src/config/app-config.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtility {
  private jwtAccessSecret: string;

  private jwtRefreshSecret: string;

  private accessTokenExpired: string;

  private refreshTokenExpired: string;

  constructor(
    private appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtAccessSecret = this.appConfigService.getEnv(
      configEnvKeys.jwtAccessSecret,
    );
    this.jwtRefreshSecret = this.appConfigService.getEnv(
      configEnvKeys.jwtRefreshSecret,
    );
    this.accessTokenExpired = this.appConfigService.getEnv(
      configEnvKeys.accessTokenExpired,
    );
    this.refreshTokenExpired = this.appConfigService.getEnv(
      configEnvKeys.refreshTokenExpired,
    );
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
    const options = {
      secret: jwtSecretKey,
      expiresIn: expired,
    };

    const jwtToken = this.jwtService.sign(payload, options);

    return jwtToken;
  }

  getUserIdByToken(token: string, isRefreshToken?: boolean) {
    try {
      const secretOrPublicKey = isRefreshToken
        ? this.jwtRefreshSecret
        : this.jwtAccessSecret;
      const result: any = this.jwtService.verify(token, {
        secret: secretOrPublicKey,
      });

      return result.userId;
    } catch (error) {
      return null;
    }
  }

  checkRefreshToken(token: string): boolean {
    try {
      this.jwtService.verify(token, { secret: this.jwtRefreshSecret });

      return true;
    } catch (_) {
      return false;
    }
  }
}
