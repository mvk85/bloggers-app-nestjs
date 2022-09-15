import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import AppConfigModule from './config/config.module';
import { MongoDbModule } from './db/mongodb/mongodb.module';
import { FeatureModule } from './feature/feature.module';
import { TestingAppModule } from './testing/testing.module';
import { AppConfigProvidersKey } from './config/types';
import { connectPostgresFactory } from './db/typeorm/connect-factory.postgres';

@Module({
  imports: [
    ConfigModule.forRoot(), // was added for included .env
    AppConfigModule,
    MongoDbModule,
    AuthModule,
    FeatureModule,
    TestingAppModule,
    TypeOrmModule.forRootAsync({
      useFactory: connectPostgresFactory,
      inject: [
        AppConfigProvidersKey.dbTypeSetting,
        AppConfigProvidersKey.sqlSetting,
        AppConfigProvidersKey.typeormSetting,
      ],
    }),
  ],
})
export class AppModule {}
