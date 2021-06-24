import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interface';
import * as mailgun from 'mailgun-js';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendUserConfirmation(
    subject: string,
    template,
    emailVars: EmailVar[],
  ) {
    const mg = mailgun({
      apiKey: this.options.apiKey,
      domain: this.options.domain,
    });

    const data = {
      from: 'Xircle support <support@xircle.org>',
      to: `2donny@naver.com`,
      subject,
      template,
    };

    emailVars.forEach((Evar) => {
      data[`v:${Evar.key}`] = Evar.value;
    });

    try {
      mg.messages().send(data, function (error, body) {
        console.log(body, error);
      });
    } catch (error) {
      console.log(error);
    }
  }
  async sendVerificationEmail(email: string, code: string) {
    await this.sendUserConfirmation(
      '✅ 안전하게 인증하고 🚀 써클에서 새로운 네트워킹을 경험하세요! ',
      'confirmation',
      [
        {
          key: 'code',
          value: code,
        },
        {
          key: 'email',
          value: email,
        },
      ],
    );
  }
}
