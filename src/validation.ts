import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';
import { ValidationError } from './errors';
import { Envelope } from './types';

export const isValidEmail = (email: string): boolean =>
  validator.isEmail(email, {
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: true,
    require_tld: true,
    allow_ip_domain: false,
    domain_specific_validation: false,
    allow_underscores: false,
  });

export const isValidPhoneNumber = (phone: string): boolean =>
  // Use validator's mobile phone validation which supports E.164 format
  // The 'any' locale allows validation for any region
  validator.isMobilePhone(phone, 'any', {
    strictMode: false, // Allow national formats in addition to E.164
  });

export const sanitizeHtml = (html: string): string =>
  // Configure DOMPurify to prevent XSS attacks
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a',
      'b',
      'i',
      'em',
      'strong',
      'u',
      'p',
      'br',
      'hr',
      'div',
      'span',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'img',
      'figure',
      'figcaption',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'class',
      'id',
      'style',
      'target',
      'rel',
    ],
    ALLOW_DATA_ATTR: false,
    // Prevent javascript: URLs
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });

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
