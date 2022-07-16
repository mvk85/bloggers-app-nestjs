import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeatureModule } from './feature/feature.module';

@Module({
  imports: [
    FeatureModule,
    ConfigModule.forRoot(), // was added for included .env
  ],
})
export class AppModule {}
