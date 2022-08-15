import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppConfigService } from './config/app-config.service';
import AppConfigModule from './config/config.module';
import { connectPostgresFactory } from './db/connect-factory.postgres';
import { DbModule } from './db/db.module';
import { FeatureModule } from './feature/feature.module';
import { TestingAppModule } from './testing/testing.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // was added for included .env
    AppConfigModule,
    DbModule,
    AuthModule,
    FeatureModule,
    TestingAppModule,
    TypeOrmModule.forRootAsync({
      useFactory: connectPostgresFactory,
      inject: [AppConfigService],
    }),
  ],
})
export class AppModule {}
