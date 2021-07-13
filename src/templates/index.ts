import { compile } from 'handlebars';
import Axios from 'axios';
import { Envelope, Mailer, Transport } from '../types';

class Templates {
  public templates: Map<string, {
    name: string
    html: string
    request?: Record<string|number, any>
  }>

  constructor(
    private mailer: Mailer<Templates>,
  ) {
    this.templates = new Map();
  }

  register({
    name, html, request,
  }: {
    name: string,
    html: string,
    request?: Record<string|number, any>
  }) {
    // Test that the template is a valid handlebars template
    try {
      if (!request) {
        const handlebarsTemplate = compile(html);
        handlebarsTemplate({});
      }
    } catch (e) {
      console.error('Parrot Messenger [Send]: Error Parsing Message Template');
      throw new Error(e);
    }

    // Add this template to the store
    this.templates.set(name, {
      name,
      html,
      request: request || null,
    });

    return this.templates;
  }

  list() {
    return [...this.templates.values()];
  }

  async send(
    name: string,
    settings: Envelope,
    data = {},
    transport?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
  ) {
    const template = this.templates.get(name);
    let content = template.html;

    if (template.request) {
      const { request } = template;

      try {
        const req = await Axios(request);
        content = request.resolve.split('.').reduce((o, i) => o[i], req.data);
      } catch (e) {
        throw new Error(`[Async Tempalte] Error: ${e.message}`);
      }
    }

    if (!content) {
      throw new Error('[Async Template] Content not found');
    }

    if (!template) {
      throw new Error(`Parrot Messenger [Send]: Template ${name} not found`);
    }

    // Compile the handlebars template and render
    const handlebarsTemplate = compile(content);
    const html = handlebarsTemplate(data);

    const message = {
      ...settings,
      html,
    };

    // MJS makes this as an export so we need
    // to access default prop of mailer
    return this.mailer.send(message, transport);
  }
}

export default Templates;
