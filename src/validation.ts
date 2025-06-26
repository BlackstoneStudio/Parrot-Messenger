import { ValidationError } from './errors';
import { Envelope } from './types';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{5,14}$/;
  return phoneRegex.test(phone);
};

export const sanitizeHtml = (html: string): string =>
  html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const validateEnvelope = (
  envelope: Partial<Envelope>,
  transportClass: 'email' | 'sms' | 'call',
): void => {
  if (!envelope.to) {
    throw new ValidationError('Recipient (to) is required');
  }

  if (!envelope.from) {
    throw new ValidationError('Sender (from) is required');
  }

  if (transportClass === 'email') {
    if (!isValidEmail(envelope.to)) {
      throw new ValidationError(`Invalid email address: ${envelope.to}`);
    }
    if (!isValidEmail(envelope.from)) {
      throw new ValidationError(`Invalid sender email address: ${envelope.from}`);
    }
    if (!envelope.subject) {
      throw new ValidationError('Subject is required for email');
    }
  } else if (transportClass === 'sms' || transportClass === 'call') {
    if (!isValidPhoneNumber(envelope.to)) {
      throw new ValidationError(`Invalid phone number: ${envelope.to}`);
    }
    if (!isValidPhoneNumber(envelope.from)) {
      throw new ValidationError(`Invalid sender phone number: ${envelope.from}`);
    }
  }

  if (!envelope.html && !envelope.text) {
    throw new ValidationError('Message content (html or text) is required');
  }
};
