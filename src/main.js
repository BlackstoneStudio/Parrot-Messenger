import Templates from './templates';
import send from './send';
import { getTransportClass } from './utlis';

const Parrot = {
  settings: {},
  init(settings) {
    const newSettings = {
      ...{
        defaultClass: 'email',
      },
      ...settings,
      ...{
        transports: settings.transports.map((t) => ({
          ...t,
          class: t.class || getTransportClass(t.name),
        })),
      },
    };
    this.settings = newSettings;
  },
  templates: new Templates(this),
  send: (data, transport) => send(data, this.default.settings, transport),
};

export default Parrot;
