import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { FeatureModule } from 'src/feature/feature.module';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';

@Module({
  imports: [FeatureModule, AuthModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingAppModule {}
