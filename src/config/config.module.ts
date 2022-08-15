import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { AppSettingConfig } from './app-setting.config';
import { EmailAdapterSettings } from './email-adapter.config';
import { AppConfigProvidersKey } from './types';

const emailAdapterProvider = {
  provide: AppConfigProvidersKey.emailAdapterSettings,
  useClass: EmailAdapterSettings,
};

const appConfigProvider = {
  provide: AppConfigProvidersKey.appConfigSetting,
  useClass: AppSettingConfig,
};

@Global()
@Module({
  providers: [
    AppConfigService,
    ConfigService,
    emailAdapterProvider,
    appConfigProvider,
  ],
  exports: [AppConfigService, emailAdapterProvider, appConfigProvider],
})
export default class AppConfigModule {}
