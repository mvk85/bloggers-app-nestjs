import { AppSettingConfig } from './configs/app-setting.config';
import { DbTypeConfig } from './configs/db-type.config';
import { EmailAdapterSettings } from './configs/email-adapter.config';
import { SqlSettingConfig } from './configs/sql-setting.config';
import { TypeOrmSettingConfig } from './configs/typeorm-setting.config';
import { AppConfigProvidersKey } from './types';

export const emailAdapterProvider = {
  provide: AppConfigProvidersKey.emailAdapterSettings,
  useClass: EmailAdapterSettings,
};

export const appConfigProvider = {
  provide: AppConfigProvidersKey.appConfigSetting,
  useClass: AppSettingConfig,
};

export const typeormConfigProvider = {
  provide: AppConfigProvidersKey.typeormSetting,
  useClass: TypeOrmSettingConfig,
};

export const sqlConfigProvider = {
  provide: AppConfigProvidersKey.sqlSetting,
  useClass: SqlSettingConfig,
};

export const dbTypeConfigProvider = {
  provide: AppConfigProvidersKey.dbTypeSetting,
  useClass: DbTypeConfig,
};

export const configProviders = [
  emailAdapterProvider,
  appConfigProvider,
  typeormConfigProvider,
  sqlConfigProvider,
  dbTypeConfigProvider,
];
