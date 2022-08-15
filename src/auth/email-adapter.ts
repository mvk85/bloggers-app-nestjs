import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigProvidersKey, IEmailAdapterSettings } from 'src/config/types';

@Injectable()
export class EmailAtapter {
  private emailAddress: string;

  private emailPassword: string;

  constructor(
    @Inject(AppConfigProvidersKey.emailAdapterSettings)
    private appConfigService: IEmailAdapterSettings,
  ) {
    this.emailAddress = this.appConfigService.getEmailAddres();
    this.emailPassword = this.appConfigService.getEmailPassword();
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
