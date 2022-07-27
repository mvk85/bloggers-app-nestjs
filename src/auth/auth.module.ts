import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { FeatureModule } from 'src/feature/feature.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { ExistConfirmationCodeRule } from './decorators/exist-confirmation-code.rule';
import { IsNotConfirmedByEmailRule } from './decorators/is-not-confirmed-by-emal.rule';
import { IsNotConfirmedRule } from './decorators/is-not-confirmed.rule';
import { EmailAtapter } from './email-adapter';
import { EmailManager } from './email-manager';
import { IpCheckerGuard } from './guards/ip-checker.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { IpCheckerRepository } from './ip-checker/ip-checker.repository';
import { IpCheckerService } from './ip-checker/ip-checker.service';
import { JwtUtility } from './jwt-utility';

@Module({
  imports: [FeatureModule, DbModule],
  controllers: [AuthController],
  providers: [
    EmailAtapter,
    EmailManager,
    AuthService,
    AuthRepository,
    JwtUtility,
    IsNotConfirmedRule,
    ExistConfirmationCodeRule,
    IsNotConfirmedByEmailRule,
    IpCheckerGuard,
    RefreshTokenGuard,
    IpCheckerService,
    IpCheckerRepository,
  ],
  exports: [AuthRepository, IpCheckerRepository],
})
export class AuthModule {}
