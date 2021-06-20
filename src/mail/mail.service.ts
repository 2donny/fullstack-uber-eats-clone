import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserConfirmation(subject: string, email: string, code: string) {
    console.log('Mail sended!');
    const url = `localhost:4000/confirm?code=${code}`;
    try {
      await this.mailerService.sendMail({
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject,
        template: './mail.ejs',
        context: {
          email,
          url,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  async sendVerificationEmail(email: string, code: string) {
    this.sendUserConfirmation(
      '✅ 안전하게 인증하고 🚀 써클에서 새로운 네트워킹을 경험하세요! ',
      email,
      code,
    );
  }
}
