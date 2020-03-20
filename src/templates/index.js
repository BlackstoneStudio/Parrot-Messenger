import Handlebars from 'handlebars';

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
   * @param name
   * @param html
   * @param text
   * @returns {[]|*[]}
   */
  register({ name, html, text }) {
    // Test that the template is a valid handlebars template
    try {
      const handlebarsTemplate = Handlebars.compile(html || text);
      handlebarsTemplate({});
    } catch (e) {
      console.error('Parrot Messenger [Send]: Error Parsing Message Template');
      throw new Error(e);
    }

    // Add this template to the store
    this.templates = [
      ...this.templates,
      { name, html: html || text },
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
   * @param name
   * @returns {*}
   */
  get(name) {
    const { templates } = this;
    return templates.find((t) => t.name === name);
  }

  /**
   * Use a Template for a new message
   * @param name
   * @param settings
   * @param data
   * @returns {*}
   */
  send(name, settings = {}, data = {}, transport = null) {
    // Find the teamplate
    const template = this.get(name);

    if (!template) {
      throw new Error(`Parrot Messenger [Send]: Template ${name} not found`);
    }

    // Compile the handlebars template and render
    const handlebarsTemplate = Handlebars.compile(template.html || template.text);
    const html = handlebarsTemplate(data);

    const message = {
      ...settings,
      html,
    };

    // MJS makes this as an export so we need
    // to access default prop of mailer
    return this.mailer.default.send(message, transport);
  }
}

export default Templates;
