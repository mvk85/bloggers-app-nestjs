import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SqlSettingConfig } from 'src/config/configs/sql-setting.config';

export const connectPostgresRawFactory = (
  sqlSetting: SqlSettingConfig,
): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: sqlSetting.getHost(), // appConfigService.getEnv(configEnvKeys.hostPostgres),
  port: Number(sqlSetting.getPort), // Number(appConfigService.getEnv(configEnvKeys.portPostgres)),
  username: sqlSetting.getUserName(), // appConfigService.getEnv(configEnvKeys.usernamePostgres),
  password: sqlSetting.getPassword(), // appConfigService.getEnv(configEnvKeys.passwordPostgres),
  database: sqlSetting.getNameDb(), // appConfigService.getEnv(configEnvKeys.nameDbPostgres),
  autoLoadEntities: false,
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});
