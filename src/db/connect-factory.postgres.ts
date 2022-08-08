import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';

export const connectPosgresFactory = (appConfigService: AppConfigService) => ({
  type: 'postgres' as const,
  host: appConfigService.getEnv(configEnvKeys.hostPostgres),
  port: Number(appConfigService.getEnv(configEnvKeys.portPostgres)),
  username: appConfigService.getEnv(configEnvKeys.usernamePostgres),
  password: appConfigService.getEnv(configEnvKeys.passwordPostgres),
  database: appConfigService.getEnv(configEnvKeys.nameDbPostgres),
  autoLoadEntities: false,
  synchronize: false,
});
