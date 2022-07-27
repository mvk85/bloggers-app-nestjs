import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';

@Injectable()
export class EmailAtapter {
  private emailAddress: string;

  private emailPassword: string;

  constructor(private appConfigService: AppConfigService) {
    this.emailAddress = this.appConfigService.getEnv(
      configEnvKeys.emailAddressApp,
    ) as string;
    this.emailPassword = this.appConfigService.getEnv(
      configEnvKeys.emailPasswordApp,
    ) as string;
  }

  async sendEmail(
    email: string,
    subject: string,
    message: string,
    title?: string,
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailAddress,
        pass: this.emailPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"${title}" ${this.emailAddress}`, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
    });

    return info;
  }
}
