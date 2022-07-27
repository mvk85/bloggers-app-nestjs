import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import AppConfigModule from './config/config.module';
import { FeatureModule } from './feature/feature.module';
import { TestingAppModule } from './testing/testing.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // was added for included .env
    AppConfigModule,
    AuthModule,
    FeatureModule,
    TestingAppModule,
  ],
})
export class AppModule {}
