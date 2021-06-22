import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interface';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS)
    private readonly options: MailModuleOptions,
  ) {
    console.log(options);
  }

  async sendUserConfirmation(subject: string, email: string, code: string) {}
  async sendVerificationEmail(email: string, code: string) {
    await this.sendUserConfirmation(
      '✅ 안전하게 인증하고 🚀 써클에서 새로운 네트워킹을 경험하세요! ',
      email,
      code,
    );
  }
}
