import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/feature/users/types';
import { EmailAtapter } from './email-adapter';

@Injectable()
export class EmailManager {
  constructor(protected emailAtapter: EmailAtapter) {}

  async sendRegistrationCode(user: UserEntity): Promise<boolean> {
    try {
      const subject = 'You need to confirm your email';
      const message = `
            <h1>Registration flow</h1>
            <div>
            <a href="https://some-front.com/confirm-registration?code=${user.confirmCode}">
                Click the link to complete registration
            </a>
            </div>
            `;
      const emailTitle = 'Registration';

      await this.emailAtapter.sendEmail(
        user.email,
        subject,
        message,
        emailTitle,
      );

      return true;
    } catch (error) {
      console.error('sendRegistrationCode error: ', error);

      return false;
    }
  }
}
