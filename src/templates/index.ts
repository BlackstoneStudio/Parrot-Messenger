import { compile } from 'handlebars';
import Axios from 'axios';

class Templates {
  /**
   * Constructor
   * @param mailer
   */
  constructor(mailer) {
    this.mailer = mailer;
    this.templates = [];
  }

  /**
   * Register a new template
   * @param name {String}
   * @param html {String}
   * @param text {String}
   * @param request {Object}
   * @returns {[]|*[]}
   */
  register({
    name, html, text, request,
  }: {
    name: string,
    html: string, 
    text: string,
    request?: Record<string|number, any>
  }) {
    // Test that the template is a valid handlebars template
    try {
      if (!request) {
        const handlebarsTemplate = compile(html || text);
        handlebarsTemplate({});
      }
    } catch (e) {
      console.error('Parrot Messenger [Send]: Error Parsing Message Template');
      throw new Error(e);
    }

    // Add this template to the store
    this.templates = [
      ...this.templates,
      {
        name,
        html: html || text,
        request: request || null,
      },
    ];

    return this.templates;
  }

  /**
   * List Registered Templates
   * @returns {[]|*[]}
   */
  list() {
    return this.templates;
  }

  /**
   * Get a given Template
   * @param name {String}
   * @returns {*}
   */
  get(name) {
    const { templates } = this;
    return templates.find((t) => t.name === name);
  }

  /**
   * Use a Template for a new message
   * @param name {String}
   * @param settings {Object}
   * @param data {Object}
   * @param transport {String|Array|Object}
   * @returns {*}
   */
  async send(name, settings = {}, data = {}, transport = null) {
    // Find the template
    const template = this.get(name);
    let content = template.html || template.text;

    if (template.request) {
      const { request } = template;

      try {
        const req = await Axios(request);
        content = request.resolve.split('.').reduce((o, i) => o[i], req.data);
      } catch (e) {
        throw new Error('[Async Tempalte] Error', e);
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
