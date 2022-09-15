import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SqlSettingConfig } from 'src/config/configs/sql-setting.config';

export const connectPostgresRawFactory = (
  sqlSetting: SqlSettingConfig,
): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: sqlSetting.getHost(),
  port: Number(sqlSetting.getPort),
  username: sqlSetting.getUserName(),
  password: sqlSetting.getPassword(),
  database: sqlSetting.getNameDb(),
  autoLoadEntities: false,
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});
