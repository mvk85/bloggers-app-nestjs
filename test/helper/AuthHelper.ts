import { TestingModule } from '@nestjs/testing';
import { JwtUtility } from 'src/auth/jwt-utility';

export class AuthHelper {
  jwtUtility: JwtUtility;

  constructor(private readonly testingModule: TestingModule) {
    this.jwtUtility = testingModule.get<JwtUtility>(JwtUtility);
  }

  generateJwtTokens(userId: string) {
    return this.jwtUtility.createJWTTokens(userId);
  }

  makeAccessHeader(userId: string) {
    const token = this.generateJwtTokens(userId);

    return { Authorization: `Bearer ${token.access}` };
  }

  makeRefreshCookie(userId: string) {
    const token = this.generateJwtTokens(userId);

    return `refreshToken=${token.refresh}`; // nameOne=valueOne
  }

  makeBasicHeader() {
    return { Authorization: 'Basic YWRtaW46cXdlcnR5' };
  }
}
