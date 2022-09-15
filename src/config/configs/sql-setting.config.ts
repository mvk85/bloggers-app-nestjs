import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../app-config.service';
import { configEnvKeys } from '../consts';

@Injectable()
export class SqlSettingConfig {
  constructor(private appConfigService: AppConfigService) {}

  getPort() {
    return this.appConfigService.getEnv(configEnvKeys.portPostgres);
  }

  getHost() {
    return this.appConfigService.getEnv(configEnvKeys.hostPostgres);
  }

  getNameDb() {
    return this.appConfigService.getEnv(configEnvKeys.nameDbPostgres);
  }

  getPassword() {
    return this.appConfigService.getEnv(configEnvKeys.passwordPostgres);
  }

  getUserName() {
    return this.appConfigService.getEnv(configEnvKeys.usernamePostgres);
  }
}
