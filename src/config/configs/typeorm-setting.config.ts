import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../app-config.service';
import { configEnvKeys } from '../consts';

@Injectable()
export class TypeOrmSettingConfig {
  constructor(private appConfigService: AppConfigService) {}

  getPort() {
    return this.appConfigService.getEnv(configEnvKeys.portToPostgres);
  }

  getHost() {
    return this.appConfigService.getEnv(configEnvKeys.hostToPostgres);
  }

  getNameDb() {
    return this.appConfigService.getEnv(configEnvKeys.nameDbToPostgres);
  }

  getPassword() {
    return this.appConfigService.getEnv(configEnvKeys.passwordToPostgres);
  }

  getUserName() {
    return this.appConfigService.getEnv(configEnvKeys.usernameToPostgres);
  }
}
