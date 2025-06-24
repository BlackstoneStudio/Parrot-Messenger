import { compile } from 'handlebars';
import Axios from 'axios';
import { Envelope, Mailer, Transport } from '../types';
import { TemplateError } from '../errors';

class Templates {
  public templates: Map<string, {
    name: string
    html: string
    request?: Record<string|number, any>
  }>;

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
      throw new TemplateError(`Error parsing template "${name}": ${e.message}`);
    }

    // Add this template to the store
    this.templates.set(name, {
      name,
      html,
      request: request || null,
    });

    return this.templates;
  }

  list(): string[] {
    const keys: string[] = [];
    this.templates.forEach((_, key) => {
      keys.push(key);
    });

    return keys;
  }

  async send(
    name: string,
    settings: Envelope,
    // eslint-disable-next-line default-param-last
    data = {},
    transport?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
  ) {
    const template = this.templates.get(name);

    if (!template) {
      throw new TemplateError(`Template "${name}" not found`);
    }

    let content = template.html;

    if (template.request) {
      const { request } = template;

      try {
        const req = await Axios(request);
        content = request.resolve.split('.').reduce((o, i) => o[i], req.data);
      } catch (e) {
        throw new TemplateError(`Error fetching async template "${name}": ${e.message}`, { request });
      }
    }

    if (!content) {
      throw new TemplateError(`No content found for template "${name}"`);
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
