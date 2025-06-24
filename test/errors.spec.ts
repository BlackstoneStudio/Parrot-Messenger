import { ParrotError, ValidationError, TransportError, TemplateError, ConfigurationError } from '../src/errors';

describe('Error Classes', () => {
  describe('ParrotError', () => {
    it('should create error with code and details', () => {
      const error = new ParrotError('Test error', 'TEST_CODE', { detail: 'value' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ detail: 'value' });
      expect(error.name).toBe('ParrotError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('TransportError', () => {
    it('should create transport error', () => {
      const error = new TransportError('Send failed', 'smtp', { reason: 'timeout' });
      expect(error.message).toBe('Send failed');
      expect(error.code).toBe('TRANSPORT_ERROR');
      expect(error.transport).toBe('smtp');
      expect(error.details).toEqual({ reason: 'timeout' });
      expect(error.name).toBe('TransportError');
    });
  });

  describe('TemplateError', () => {
    it('should create template error', () => {
      const error = new TemplateError('Template not found');
      expect(error.message).toBe('Template not found');
      expect(error.code).toBe('TEMPLATE_ERROR');
      expect(error.name).toBe('TemplateError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Missing API key');
      expect(error.message).toBe('Missing API key');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
    });
  });
});