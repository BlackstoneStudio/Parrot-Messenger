/* eslint-disable max-classes-per-file */

export class ParrotError extends Error {
  constructor(message: string, public code: string, public details?: Record<string, unknown>) {
    super(message);
    this.name = 'ParrotError';
  }
}

export class ValidationError extends ParrotError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TransportError extends ParrotError {
  constructor(message: string, public transport: string, details?: Record<string, unknown>) {
    super(message, 'TRANSPORT_ERROR', details);
    this.name = 'TransportError';
  }
}

export class TemplateError extends ParrotError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TEMPLATE_ERROR', details);
    this.name = 'TemplateError';
  }
}

export class ConfigurationError extends ParrotError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}
