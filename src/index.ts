import Templates from './templates';
import send from './send';
import getTransportClass from './utlis';
import { Settings } from './types';

class Parrot {
  public templates: Templates

  constructor(
    private settings: Settings,
  ) {
    this.settings = {
      ...settings,
      defaultClass: 'email',
      transports: settings.transports.map((t) => ({
        ...t,
        class: getTransportClass(t.name),
      })),
    };

    this.templates = new Templates(this);
  }

  send(data, transport) {
    send(data, this.settings, transport);
  }
}

export default Parrot;
