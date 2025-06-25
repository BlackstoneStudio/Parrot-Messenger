import Axios from 'axios';
import Templates from '../src/templates';
import { TemplateError } from '../src/errors';

jest.mock('axios');

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

    it('should fetch and compile async template', async () => {
      const mockAxios = Axios as jest.MockedFunction<typeof Axios>;
      mockAxios.mockResolvedValueOnce({
        data: {
          data: {
            html: '<p>Async Hello {{name}}!</p>'
          }
        }
      });

      templates.register({
        name: 'async-template',
        html: '',
        request: {
          url: 'https://api.example.com/template',
          method: 'GET',
          resolve: 'data.html'
        }
      });

      await templates.send(
        'async-template',
        {
          to: 'test@example.com',
          from: 'sender@example.com',
          subject: 'Async Test'
        },
        {
          name: 'AsyncUser'
        }
      );

      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/template',
          method: 'GET',
          resolve: 'data.html'
        })
      );

      expect(mockMailer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<p>Async Hello AsyncUser!</p>'
        }),
        undefined
      );
    });

    it('should handle async template fetch errors', async () => {
      const mockAxios = Axios as jest.MockedFunction<typeof Axios>;
      mockAxios.mockRejectedValueOnce(new Error('Network error'));

      templates.register({
        name: 'failing-async-template',
        html: '',
        request: {
          url: 'https://api.example.com/template',
          method: 'GET',
          resolve: 'data.html'
        }
      });

      await expect(
        templates.send(
          'failing-async-template',
          {
            to: 'test@example.com',
            from: 'sender@example.com',
            subject: 'Test'
          },
          {}
        )
      ).rejects.toThrow('Error fetching async template "failing-async-template": Network error');
    });

    it('should throw error when template has no content', async () => {
      templates.register({
        name: 'empty-template',
        html: ''
      });

      await expect(
        templates.send(
          'empty-template',
          {
            to: 'test@example.com',
            from: 'sender@example.com',
            subject: 'Test'
          },
          {}
        )
      ).rejects.toThrow('No content found for template "empty-template"');
    });

    it('should handle deeply nested resolve path', async () => {
      const mockAxios = Axios as jest.MockedFunction<typeof Axios>;
      mockAxios.mockResolvedValueOnce({
        data: {
          response: {
            templates: {
              main: '<p>Deep {{message}}</p>'
            }
          }
        }
      });

      templates.register({
        name: 'deep-template',
        html: '',
        request: {
          url: 'https://api.example.com/templates',
          method: 'GET',
          resolve: 'response.templates.main'
        }
      });

      await templates.send(
        'deep-template',
        {
          to: 'test@example.com',
          from: 'sender@example.com',
          subject: 'Deep Test'
        },
        {
          message: 'nested content'
        }
      );

      expect(mockMailer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<p>Deep nested content</p>'
        }),
        undefined
      );
    });
  });
});