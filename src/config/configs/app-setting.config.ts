import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../app-config.service';
import { configEnvKeys } from '../consts';

@Injectable()
export class AppSettingConfig {
  constructor(private appConfigService: AppConfigService) {}

  public get isProduction() {
    const nodeEnv = this.appConfigService.getEnv(configEnvKeys.nodeEnv);

    return nodeEnv === 'Production';
  }
}
