import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configEnvKeys } from './consts';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  public getEnv(key: configEnvKeys) {
    if (key === configEnvKeys.port) {
      return this.configService.get<string>(configEnvKeys.port, '3000');
    }

    if (key === configEnvKeys.nodeEnv) {
      return this.configService.get<string>(configEnvKeys.nodeEnv);
    }

    if (key === configEnvKeys.emailAddressApp) {
      return this.configService.get<string>(configEnvKeys.emailAddressApp, '');
    }

    if (key === configEnvKeys.emailPasswordApp) {
      return this.configService.get<string>(configEnvKeys.emailPasswordApp, '');
    }

    if (key === configEnvKeys.jwtAccessSecret) {
      return this.configService.get<string>(
        configEnvKeys.jwtAccessSecret,
        '123',
      );
    }

    if (key === configEnvKeys.jwtRefreshSecret) {
      return this.configService.get<string>(
        configEnvKeys.jwtRefreshSecret,
        '456',
      );
    }

    if (key === configEnvKeys.accessTokenExpired) {
      return this.configService.get<string>(
        configEnvKeys.accessTokenExpired,
        '5m',
      );
    }

    if (key === configEnvKeys.refreshTokenExpired) {
      return this.configService.get<string>(
        configEnvKeys.refreshTokenExpired,
        '20m',
      );
    }

    if (key === configEnvKeys.mongoURI) {
      return this.configService.get<string>(
        configEnvKeys.mongoURI,
        'mongodb://0.0.0.0:27017',
      );
    }

    if (key === configEnvKeys.mongoDBName) {
      return this.configService.get<string>(
        configEnvKeys.mongoDBName,
        'social',
      );
    }

    if (key === configEnvKeys.adminLogin) {
      return this.configService.get<string>(configEnvKeys.adminLogin, 'admin');
    }

    if (key === configEnvKeys.adminPassword) {
      return this.configService.get<string>(
        configEnvKeys.adminPassword,
        'qwerty',
      );
    }

    if (key === configEnvKeys.portPostgres) {
      return this.configService.get<string>(configEnvKeys.portPostgres, '5432');
    }

    if (key === configEnvKeys.hostPostgres) {
      return this.configService.get<string>(
        configEnvKeys.hostPostgres,
        'localhost',
      );
    }

    if (key === configEnvKeys.nameDbPostgres) {
      return this.configService.get<string>(
        configEnvKeys.nameDbPostgres,
        'social',
      );
    }

    if (key === configEnvKeys.passwordPostgres) {
      return this.configService.get<string>(
        configEnvKeys.passwordPostgres,
        '111',
      );
    }

    if (key === configEnvKeys.usernamePostgres) {
      return this.configService.get<string>(
        configEnvKeys.usernamePostgres,
        'postgres',
      );
    }

    if (key === configEnvKeys.dbType) {
      return this.configService.get<string>(configEnvKeys.dbType, 'mongodb');
    }
  }
}
