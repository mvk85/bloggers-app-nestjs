import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';

export const jwtModuleAsyncOptions: JwtModuleAsyncOptions = {
  useFactory: async (appConfigService: AppConfigService) => ({
    secret: appConfigService.getEnv(configEnvKeys.jwtAccessSecret),
    signOptions: {
      expiresIn: appConfigService.getEnv(configEnvKeys.accessTokenExpired),
    },
  }),
  inject: [AppConfigService],
};
