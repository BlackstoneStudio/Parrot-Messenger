import * as mailjet from 'node-mailjet';
import { htmlToText } from 'html-to-text';
import { Envelope, GenericTransport, MailjetSMS as IMailjetSMS } from '../../types';

class MailjetSMS implements GenericTransport<mailjet.SMS.PostResource> {
  transport: mailjet.SMS.PostResource

  constructor(private settings: IMailjetSMS) {
    this.transport = mailjet
      .connect(settings.auth.apiKey)
      .post('sms-send');
  }

  async send(message: Envelope) {
    const request = {
      ...this.settings.defaults,
      ...message,
    };

    await this.transport.request({
      From: request.from,
      To: request.to,
      Text: htmlToText(request.html),
    });
  }
}

export default MailjetSMS;
