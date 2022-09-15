export interface IEmailAdapterSettings {
  getEmailPassword: () => string;
  getEmailAddres: () => string;
}

export enum AppConfigProvidersKey {
  emailAdapterSettings = 'EmailAdapterSettings',
  appConfigSetting = 'appConfigSetting',
  typeormSetting = 'TypeOrmSettingConfig',
  sqlSetting = 'SqlSettingConfig',
  dbTypeSetting = 'dbTypeSetting',
}
