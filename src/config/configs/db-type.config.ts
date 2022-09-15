import { Injectable } from '@nestjs/common';
import { DbType } from 'src/types';
import { AppConfigService } from '../app-config.service';
import { configEnvKeys } from '../consts';

@Injectable()
export class DbTypeConfig {
  constructor(private appConfigService: AppConfigService) {}

  public get isMongo() {
    const dbType = this.appConfigService.getEnv(configEnvKeys.dbType);

    return dbType === DbType.Mongo;
  }

  public get isSql() {
    const dbType = this.appConfigService.getEnv(configEnvKeys.dbType);

    return dbType === DbType.Sql;
  }

  public get isTypeorm() {
    const dbType = this.appConfigService.getEnv(configEnvKeys.dbType);

    return dbType === DbType.Typeorm;
  }
}
