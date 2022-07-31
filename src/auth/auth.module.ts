import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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
import { jwtModuleAsyncOptions } from './jwt-module-options';
import { JwtUtility } from './jwt-utility';
import { BasicStrategy } from './strategies/basic-auth.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local-auth.strategy';

@Module({
  imports: [
    FeatureModule,
    PassportModule,
    JwtModule.registerAsync(jwtModuleAsyncOptions),
  ],
  controllers: [AuthController],
  providers: [
    EmailAtapter,
    EmailManager,
    AuthService,
    AuthRepository,
    IsNotConfirmedRule,
    ExistConfirmationCodeRule,
    IsNotConfirmedByEmailRule,
    IpCheckerGuard,
    RefreshTokenGuard,
    IpCheckerService,
    IpCheckerRepository,
    LocalStrategy,
    BasicStrategy,
    JwtStrategy,
    JwtUtility,
  ],
  exports: [AuthRepository, IpCheckerRepository],
})
export class AuthModule {}
