import path from 'path';

import nodemailer from 'nodemailer';

export interface EmailType {
  sendEmail(x: nodemailer.Transporter): Promise<void>;
}
export interface EmailData {
  to: string;
  username: string;
  message?: string;
}

export const emailTemplatesPath = path.resolve(
  `${__dirname}/../../EmailTemplates`
);

export class EmailConfig {
  constructor(public emailType: EmailType) {}

  transporter() {
    return nodemailer.createTransport({
      //@ts-ignore
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.NODE_ENV === 'development' ? false : true, // upgrade later with STARTTLS
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USERNAME as string,
        pass: process.env.EMAIL_PASS as string,
      },
      logger: true,
    });
  }

  async send(): Promise<void> {
    await this.emailType.sendEmail(this.transporter());
  }
}
