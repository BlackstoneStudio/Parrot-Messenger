import { isValidEmail, isValidPhoneNumber, sanitizeHtml, validateEnvelope } from '../src/validation';

describe('Validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhoneNumber('+14155552222')).toBe(true);
      expect(isValidPhoneNumber('14155552222')).toBe(true);
      expect(isValidPhoneNumber('+447911123456')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abc')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
      expect(isValidPhoneNumber('+0123456789')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(sanitizeHtml("It's a test & more")).toBe("It&apos;s a test &amp; more");
    });
  });

  describe('validateEnvelope', () => {
    it('should validate email envelopes', () => {
      expect(() => validateEnvelope({
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test',
        html: 'Content'
      }, 'email')).not.toThrow();
    });

    it('should validate SMS envelopes', () => {
      expect(() => validateEnvelope({
        to: '+14155552222',
        from: '+14155551111',
        text: 'SMS content'
      }, 'sms')).not.toThrow();
    });

    it('should throw on missing required fields', () => {
      expect(() => validateEnvelope({}, 'email')).toThrow('Recipient (to) is required');
      expect(() => validateEnvelope({ to: 'test@example.com' }, 'email')).toThrow('Sender (from) is required');
      expect(() => validateEnvelope({
        to: 'test@example.com',
        from: 'sender@example.com'
      }, 'email')).toThrow('Subject is required for email');
    });

    it('should throw on invalid email addresses', () => {
      expect(() => validateEnvelope({
        to: 'invalid',
        from: 'sender@example.com',
        subject: 'Test',
        html: 'Content'
      }, 'email')).toThrow('Invalid email address: invalid');
    });

    it('should throw on invalid sender email address', () => {
      expect(() => validateEnvelope({
        to: 'test@example.com',
        from: 'invalid-sender',
        subject: 'Test',
        html: 'Content'
      }, 'email')).toThrow('Invalid sender email address: invalid-sender');
    });

    it('should throw on invalid phone numbers', () => {
      expect(() => validateEnvelope({
        to: '123',
        from: '+14155551111',
        text: 'SMS'
      }, 'sms')).toThrow('Invalid phone number: 123');
    });

    it('should throw on invalid sender phone number', () => {
      expect(() => validateEnvelope({
        to: '+14155552222',
        from: 'invalid-phone',
        text: 'SMS'
      }, 'sms')).toThrow('Invalid sender phone number: invalid-phone');
    });

    it('should require content', () => {
      expect(() => validateEnvelope({
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test'
      }, 'email')).toThrow('Message content (html or text) is required');
    });
  });
});