import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { FeatureModule } from 'src/feature/feature.module';
import { RepositoriesModule } from 'src/feature/repositories.module';
import { ThrottlerProxyGuard } from 'src/guards/trottle.guard';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { ExistConfirmationCodeRule } from './decorators/exist-confirmation-code.rule';
import { IsNotConfirmedByEmailRule } from './decorators/is-not-confirmed-by-emal.rule';
import { IsNotConfirmedRule } from './decorators/is-not-confirmed.rule';
import { EmailAtapter } from './email-adapter';
import { EmailManager } from './email-manager';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { jwtModuleAsyncOptions } from './jwt-module-options';
import { JwtUtility } from './jwt-utility';
import { BasicStrategy } from './strategies/basic-auth.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local-auth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FeatureModule,
    PassportModule,
    JwtModule.registerAsync(jwtModuleAsyncOptions),
    RepositoriesModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 10, // 10 sec
      limit: 5, // 5 attempts
    }),
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
    RefreshTokenGuard,
    LocalStrategy,
    BasicStrategy,
    JwtStrategy,
    JwtUtility,
    ThrottlerProxyGuard,
  ],
  exports: [AuthRepository],
})
export class AuthModule {}
