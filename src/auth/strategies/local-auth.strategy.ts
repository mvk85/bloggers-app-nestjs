import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'login',
    });
  }

  async validate(login: string, password: string): Promise<any> {
    return {
      login,
      password,
    };
  }
}
