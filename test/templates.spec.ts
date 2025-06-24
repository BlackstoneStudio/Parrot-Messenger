import Templates from '../src/templates';
import { TemplateError } from '../src/errors';

describe('Templates', () => {
  let templates: Templates;
  let mockMailer: any;

  beforeEach(() => {
    mockMailer = {
      send: jest.fn().mockResolvedValue(undefined)
    };
    templates = new Templates(mockMailer);
  });

  describe('register', () => {
    it('should register a valid template', () => {
      templates.register({
        name: 'test-template',
        html: '<h1>Hello {{name}}</h1>'
      });

      expect(templates.list()).toContain('test-template');
    });

    it('should throw on invalid Handlebars template', () => {
      expect(() => {
        templates.register({
          name: 'invalid',
          html: '<h1>{{#if}}Invalid{{/if}}</h1>'
        });
      }).toThrow(TemplateError);
    });

    it('should register async template with request config', () => {
      templates.register({
        name: 'async-template',
        html: '',
        request: {
          url: 'https://example.com/template',
          method: 'GET',
          resolve: 'data.html'
        }
      });

      expect(templates.list()).toContain('async-template');
    });
  });

  describe('list', () => {
    it('should return empty array when no templates', () => {
      expect(templates.list()).toEqual([]);
    });

    it('should return all registered template names', () => {
      templates.register({ name: 'template1', html: 'Test 1' });
      templates.register({ name: 'template2', html: 'Test 2' });

      const list = templates.list();
      expect(list).toHaveLength(2);
      expect(list).toContain('template1');
      expect(list).toContain('template2');
    });
  });

  describe('send', () => {
    beforeEach(() => {
      templates.register({
        name: 'test-template',
        html: '<p>Hello {{name}}! Your code is {{code}}</p>'
      });
    });

    it('should compile and send template with data', async () => {
      await templates.send(
        'test-template',
        {
          to: 'test@example.com',
          from: 'sender@example.com',
          subject: 'Test'
        },
        {
          name: 'John',
          code: '12345'
        },
        { class: 'email', name: 'smtp' }
      );

      expect(mockMailer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          from: 'sender@example.com',
          subject: 'Test',
          html: '<p>Hello John! Your code is 12345</p>'
        }),
        { class: 'email', name: 'smtp' }
      );
    });

    it('should throw when template not found', async () => {
      await expect(
        templates.send('non-existent', { to: 'test@example.com', from: 'sender@example.com', subject: 'Test' }, {})
      ).rejects.toThrow(TemplateError);
    });

    it('should handle empty data object', async () => {
      templates.register({
        name: 'static-template',
        html: '<p>Static content</p>'
      });

      await templates.send(
        'static-template',
        {
          to: 'test@example.com',
          from: 'sender@example.com',
          subject: 'Test'
        }
      );

      expect(mockMailer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<p>Static content</p>'
        }),
        undefined
      );
    });
  });
});