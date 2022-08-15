import { Injectable } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import { configEnvKeys } from './consts';
import { IEmailAdapterSettings } from './types';

@Injectable()
export class EmailAdapterSettings implements IEmailAdapterSettings {
  constructor(private appConfigService: AppConfigService) {}

  getEmailPassword = () =>
    this.appConfigService.getEnv(configEnvKeys.emailPasswordApp);

  getEmailAddres = () =>
    this.appConfigService.getEnv(configEnvKeys.emailAddressApp);
}
