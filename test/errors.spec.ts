import {
  ParrotError,
  ValidationError,
  TransportError,
  TemplateError,
  ConfigurationError,
  isParrotError,
  isValidationError,
  isTransportError,
  isTemplateError,
  isConfigurationError,
} from '../src/errors';

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

  describe('Type Guards', () => {
    const parrotError = new ParrotError('Test', 'TEST_CODE');
    const validationError = new ValidationError('Test');
    const transportError = new TransportError('Test', 'smtp');
    const templateError = new TemplateError('Test');
    const configError = new ConfigurationError('Test');
    const regularError = new Error('Test');

    describe('isParrotError', () => {
      it('should identify ParrotError instances', () => {
        expect(isParrotError(parrotError)).toBe(true);
        expect(isParrotError(validationError)).toBe(true);
        expect(isParrotError(transportError)).toBe(true);
        expect(isParrotError(templateError)).toBe(true);
        expect(isParrotError(configError)).toBe(true);
      });

      it('should return false for non-ParrotError instances', () => {
        expect(isParrotError(regularError)).toBe(false);
        expect(isParrotError(null)).toBe(false);
        expect(isParrotError(undefined)).toBe(false);
        expect(isParrotError('string')).toBe(false);
        expect(isParrotError({})).toBe(false);
      });
    });

    describe('isValidationError', () => {
      it('should identify ValidationError instances', () => {
        expect(isValidationError(validationError)).toBe(true);
      });

      it('should return false for other error types', () => {
        expect(isValidationError(parrotError)).toBe(false);
        expect(isValidationError(transportError)).toBe(false);
        expect(isValidationError(regularError)).toBe(false);
        expect(isValidationError(null)).toBe(false);
      });
    });

    describe('isTransportError', () => {
      it('should identify TransportError instances', () => {
        expect(isTransportError(transportError)).toBe(true);
      });

      it('should return false for other error types', () => {
        expect(isTransportError(parrotError)).toBe(false);
        expect(isTransportError(validationError)).toBe(false);
        expect(isTransportError(regularError)).toBe(false);
        expect(isTransportError(null)).toBe(false);
      });
    });

    describe('isTemplateError', () => {
      it('should identify TemplateError instances', () => {
        expect(isTemplateError(templateError)).toBe(true);
      });

      it('should return false for other error types', () => {
        expect(isTemplateError(parrotError)).toBe(false);
        expect(isTemplateError(validationError)).toBe(false);
        expect(isTemplateError(regularError)).toBe(false);
        expect(isTemplateError(null)).toBe(false);
      });
    });

    describe('isConfigurationError', () => {
      it('should identify ConfigurationError instances', () => {
        expect(isConfigurationError(configError)).toBe(true);
      });

      it('should return false for other error types', () => {
        expect(isConfigurationError(parrotError)).toBe(false);
        expect(isConfigurationError(validationError)).toBe(false);
        expect(isConfigurationError(regularError)).toBe(false);
        expect(isConfigurationError(null)).toBe(false);
      });
    });
  });
});
