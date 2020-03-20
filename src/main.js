import Templates from './templates';
import send from './send';

const Parrot = {
  settings: {},
  init(settings) {
    this.settings = settings;
  },
  templates: new Templates(this),
  send: (data, transport) => send(data, this.default.settings, transport),
};

export default Parrot;
