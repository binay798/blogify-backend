import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { emailTemplatesPath } from './EmailConfig';
import { EmailData } from './EmailConfig';

import { EmailType } from './EmailConfig';

export class WelcomeEmail implements EmailType {
  constructor(public data: EmailData) {}

  async sendEmail(transporter: nodemailer.Transporter): Promise<void> {
    const html = await ejs.renderFile(
      `${emailTemplatesPath}/welcomeEmail.ejs`,
      {
        username: this.data.username,
      }
    );
    const mailOptions = {
      from: process.env.EMAIL_HOST,
      to: this.data.to,
      html: html,
      subject: 'Welcome To Our Website',
    };
    return await transporter.sendMail(mailOptions);
  }
}
