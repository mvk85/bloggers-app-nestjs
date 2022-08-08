import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configEnvKeys } from './consts';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  public get isProduction() {
    const nodeEnv = this.configService.get<string>(configEnvKeys.nodeEnv);

    return nodeEnv === 'Production';
  }

  public getEnv(key: configEnvKeys) {
    if (key === configEnvKeys.port) {
      const port = this.configService.get<string>(configEnvKeys.port);

      return port || '3000';
    }

    if (key === configEnvKeys.nodeEnv) {
      const nodeEnv = this.configService.get<string>(configEnvKeys.nodeEnv);

      return nodeEnv;
    }

    if (key === configEnvKeys.emailAddressApp) {
      const email = this.configService.get<string>(
        configEnvKeys.emailAddressApp,
      );

      return email || '';
    }

    if (key === configEnvKeys.emailPasswordApp) {
      const emailPassword = this.configService.get<string>(
        configEnvKeys.emailPasswordApp,
      );

      return emailPassword || '';
    }

    if (key === configEnvKeys.jwtAccessSecret) {
      const jwtAccessSecret = this.configService.get<string>(
        configEnvKeys.jwtAccessSecret,
      );

      return jwtAccessSecret || '123';
    }

    if (key === configEnvKeys.jwtRefreshSecret) {
      const jwtRefreshSecret = this.configService.get<string>(
        configEnvKeys.jwtRefreshSecret,
      );

      return jwtRefreshSecret || '456';
    }

    if (key === configEnvKeys.accessTokenExpired) {
      const accessTokenExpired = this.configService.get<string>(
        configEnvKeys.accessTokenExpired,
      );

      return accessTokenExpired || '5m';
    }

    if (key === configEnvKeys.refreshTokenExpired) {
      const refreshTokenExpired = this.configService.get<string>(
        configEnvKeys.refreshTokenExpired,
      );

      return refreshTokenExpired || '20m';
    }

    if (key === configEnvKeys.mongoURI) {
      const mongoURI = this.configService.get<string>(configEnvKeys.mongoURI);

      return mongoURI || 'mongodb://0.0.0.0:27017';
    }

    if (key === configEnvKeys.mongoDBName) {
      const mongoDBName = this.configService.get<string>(
        configEnvKeys.mongoDBName,
      );

      return mongoDBName || 'social';
    }

    if (key === configEnvKeys.adminLogin) {
      const adminLogin = this.configService.get<string>(
        configEnvKeys.adminLogin,
      );

      return adminLogin || 'admin';
    }

    if (key === configEnvKeys.adminPassword) {
      const adminPassword = this.configService.get<string>(
        configEnvKeys.adminPassword,
      );

      return adminPassword || 'qwerty';
    }

    if (key === configEnvKeys.portPostgres) {
      const portPostgres = this.configService.get<string>(
        configEnvKeys.portPostgres,
      );

      return portPostgres || '5432';
    }

    if (key === configEnvKeys.hostPostgres) {
      const hostPostgres = this.configService.get<string>(
        configEnvKeys.hostPostgres,
      );

      return hostPostgres || 'localhost';
    }

    if (key === configEnvKeys.nameDbPostgres) {
      const nameDbPostgres = this.configService.get<string>(
        configEnvKeys.nameDbPostgres,
      );

      return nameDbPostgres || 'social';
    }

    if (key === configEnvKeys.passwordPostgres) {
      const passwordPostgres = this.configService.get<string>(
        configEnvKeys.passwordPostgres,
      );

      return passwordPostgres || '111';
    }

    if (key === configEnvKeys.usernamePostgres) {
      const usernamePostgres = this.configService.get<string>(
        configEnvKeys.usernamePostgres,
      );

      return usernamePostgres || 'postgres';
    }
  }
}
