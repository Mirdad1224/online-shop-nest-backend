import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  sendMail(to: string, subject: string, html?: string, text?: string) {
    this.mailService.sendMail({
      from: 'alix@gmail.com',
      to,
      subject,
      html,
      text,
    });
  }
}
