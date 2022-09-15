import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DbTypeConfig } from 'src/config/configs/db-type.config';
import { SqlSettingConfig } from 'src/config/configs/sql-setting.config';
import { TypeOrmSettingConfig } from 'src/config/configs/typeorm-setting.config';
import { connectPostgresRawFactory } from './connect-factory.postgres.raw';
import { connectPostgresToFactory } from './connect-factory.postgres.to';

export const connectPostgresFactory = (
  dbTypeSetting: DbTypeConfig,
  sqlSetting: SqlSettingConfig,
  typeormSetting: TypeOrmSettingConfig,
): TypeOrmModuleOptions => {
  if (dbTypeSetting.isSql) return connectPostgresRawFactory(sqlSetting);

  if (dbTypeSetting.isTypeorm) return connectPostgresToFactory(typeormSetting);

  throw new Error('Connection to database is not configured');
};
