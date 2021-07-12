import Templates from './templates';
import send from './send';
import getTransportClass from './utlis';
import {
  Envelope, Mailer, ParrotSettings, Transport,
} from './types';

class Parrot implements Mailer<Templates> {
  public templates: Templates

  constructor(
    private settings: ParrotSettings = {
      defaultClass: 'email',
      transports: [],
    },
  ) {
    this.settings = {
      defaultClass: settings.defaultClass,
      ...settings,
    };

    this.templates = new Templates(this);
  }

  send(
    message: Envelope,
    transport?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
  ) {
    const transports = this.settings.transports.map((t) => ({
      ...t,
      class: getTransportClass(t.name),
    }));

    send(
      message,
      transports as Transport[],
      transport,
    );
  }
}

export default Parrot;
