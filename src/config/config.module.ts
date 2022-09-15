import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { configProviders } from './config.providers';

@Global()
@Module({
  providers: [AppConfigService, ConfigService, ...configProviders],
  exports: [AppConfigService, ...configProviders],
})
export default class AppConfigModule {}
