import path from 'path';
import ejs from 'ejs';
import nodemailer, { TransportOptions, Transport } from 'nodemailer';

const emailPath = path.resolve(`${__dirname}/../EmailTemplates`);

interface Data {
  subject?: string;
  url?: string;
}

export class EmailConfig {
  transportOptions = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // upgrade later with STARTTLS
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASS,
    },
    logger: true,
  };
  constructor(public from: string, public to: string, public data: Data) {}

  async transporter() {
    return await nodemailer.createTransport({
      //@ts-ignore
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // upgrade later with STARTTLS
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USERNAME as string,
        pass: process.env.EMAIL_PASS as string,
      },
      logger: true,
    });
  }

  async sendEmail(html: string) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: this.data.subject,
      html: html,
    };

    return await (await this.transporter()).sendMail(mailOptions);
  }

  async welcomeEmail() {
    const html = await ejs.renderFile(`${emailPath}/welcomeEmail.ejs`);
    await this.sendEmail(html);
  }

  async passwordResetEmail() {
    const html = await ejs.renderFile(`${emailPath}/PasswordReset.ejs`, {
      url: this.data.url,
    });
    await this.sendEmail(html);
  }
}
