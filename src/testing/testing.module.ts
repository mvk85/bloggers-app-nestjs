import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { FeatureModule } from 'src/feature/feature.module';
import { RepositoriesModule } from 'src/feature/repositories.module';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FeatureModule,
    AuthModule,
    RepositoriesModule.forRoot(),
  ],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingAppModule {}
