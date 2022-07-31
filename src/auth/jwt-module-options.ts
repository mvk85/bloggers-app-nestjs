import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';

export const jwtModuleAsyncOptions: JwtModuleAsyncOptions = {
  useFactory: async (appConfigService: AppConfigService) => ({
    secret: appConfigService.getEnv(configEnvKeys.jwtAccessSecret) as string,
    signOptions: {
      expiresIn: appConfigService.getEnv(
        configEnvKeys.accessTokenExpired,
      ) as string,
    },
  }),
  inject: [AppConfigService],
};
