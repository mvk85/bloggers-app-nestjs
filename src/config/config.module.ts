import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  providers: [AppConfigService, ConfigService],
  exports: [AppConfigService],
})
export default class AppConfigModule {}
