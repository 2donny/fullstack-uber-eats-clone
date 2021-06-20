import * as path from 'path';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: `smtps://${process.env.MAIL_USER}@gmail.com:${process.env.MAIL_PASS}@smtp.gmail.com`,
      defaults: {
        from: `"No Reply" <noreply@xircle.org>`,
      },
      template: {
        dir: path.join(process.cwd(), 'src/templates'),
        adapter: new EjsAdapter({ inlineCssEnabled: true }),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
