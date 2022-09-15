import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmSettingConfig } from 'src/config/configs/typeorm-setting.config';

export const connectPostgresToFactory = (
  typeormSetting: TypeOrmSettingConfig,
): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: typeormSetting.getHost(),
  port: Number(typeormSetting.getPort()),
  username: typeormSetting.getUserName(),
  password: typeormSetting.getPassword(),
  database: typeormSetting.getNameDb(),
  autoLoadEntities: true,
  synchronize: true,
  // logging: true,
  ssl: { rejectUnauthorized: false },
});
