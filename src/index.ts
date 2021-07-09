import Templates from './templates';
import send from './send';
import getTransportClass from './utlis';
import { Envelope, Settings } from './types';

class Parrot {
  public templates: Templates

  constructor(
    private settings: Settings = {
      defaultClass: 'email',
      transports: [],
    },
  ) {
    this.settings = {
      defaultClass: settings.defaultClass,
      ...settings,
      transports: settings.transports.map((t) => ({
        ...t,
        class: getTransportClass(t.name),
      })),
    };

    this.templates = new Templates(this);
  }

  send(message: Envelope, transport) {
    send(message, this.settings, transport);
  }
}

export default Parrot;
