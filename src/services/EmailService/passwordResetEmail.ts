import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { emailTemplatesPath } from './EmailConfig';
import { EmailData } from './EmailConfig';

import { EmailType } from './EmailConfig';

export class PasswordResetEmail implements EmailType {
  constructor(public data: EmailData) {}

  async sendEmail(transporter: nodemailer.Transporter): Promise<void> {
    const html = await ejs.renderFile(
      `${emailTemplatesPath}/PasswordReset.ejs`,
      {
        username: this.data.username,
        url: this.data.message,
      }
    );
    const mailOptions = {
      from: process.env.EMAIL_HOST,
      to: this.data.to,
      html: html,
      subject: 'Reset your password',
    };
    return await transporter.sendMail(mailOptions);
  }
}
