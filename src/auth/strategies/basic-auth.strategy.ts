import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private appConfigService: AppConfigService) {
    super();
  }

  public validate = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    const adminLogin = this.appConfigService.getEnv(configEnvKeys.adminLogin);
    const adminPassword = this.appConfigService.getEnv(
      configEnvKeys.adminPassword,
    );

    if (adminLogin === username && adminPassword === password) {
      return true;
    }

    throw new UnauthorizedException();
  };
}
