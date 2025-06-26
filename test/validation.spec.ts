import {
  isValidEmail,
  isValidPhoneNumber,
  sanitizeHtml,
  validateEnvelope,
} from '../src/validation';

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
    it('should remove dangerous HTML tags and scripts', () => {
      // Scripts should be completely removed
      expect(sanitizeHtml('<script>alert("XSS")</script>')).toBe('');
      expect(sanitizeHtml('<p>Hello <script>alert("XSS")</script> World</p>')).toBe(
        '<p>Hello  World</p>',
      );
    });

    it('should allow safe HTML tags', () => {
      expect(sanitizeHtml('<p>Hello <b>World</b></p>')).toBe('<p>Hello <b>World</b></p>');
      expect(
        sanitizeHtml('<h1>Title</h1><p>Content with <a href="https://example.com">link</a></p>'),
      ).toBe('<h1>Title</h1><p>Content with <a href="https://example.com">link</a></p>');
    });

    it('should handle special characters safely', () => {
      // DOMPurify doesn't escape plain text ampersands
      expect(sanitizeHtml("It's a test & more")).toBe("It's a test & more");
      // But it does escape < and > in HTML context
      expect(sanitizeHtml('<p>5 < 10 && 10 > 5</p>')).toBe('<p>5 &lt; 10 &amp;&amp; 10 &gt; 5</p>');
    });

    it('should remove javascript: URLs', () => {
      expect(sanitizeHtml('<a href="javascript:alert(\'XSS\')">Click</a>')).toBe('<a>Click</a>');
      // DOMPurify keeps the img tag but removes the javascript: src
      expect(sanitizeHtml('<img src="javascript:alert(\'XSS\')">')).toBe('<img>');
    });

    it('should remove event handlers', () => {
      expect(sanitizeHtml('<div onclick="alert(\'XSS\')">Click me</div>')).toBe(
        '<div>Click me</div>',
      );
      expect(sanitizeHtml('<img src="image.jpg" onerror="alert(\'XSS\')">')).toBe(
        '<img src="image.jpg">',
      );
    });
  });

  describe('validateEnvelope', () => {
    it('should validate email envelopes', () => {
      expect(() =>
        validateEnvelope(
          {
            to: 'test@example.com',
            from: 'sender@example.com',
            subject: 'Test',
            html: 'Content',
          },
          'email',
        ),
      ).not.toThrow();
    });

    it('should validate SMS envelopes', () => {
      expect(() =>
        validateEnvelope(
          {
            to: '+14155552222',
            from: '+14155551111',
            text: 'SMS content',
          },
          'sms',
        ),
      ).not.toThrow();
    });

    it('should validate call envelopes', () => {
      expect(() =>
        validateEnvelope(
          {
            to: '+14155552222',
            from: '+14155551111',
            text: 'Call content',
            voice: 'Amy',
          },
          'call',
        ),
      ).not.toThrow();
    });

    it('should throw on missing required fields', () => {
      expect(() => validateEnvelope({}, 'email')).toThrow('Recipient (to) is required');
      expect(() => validateEnvelope({ to: 'test@example.com' }, 'email')).toThrow(
        'Sender (from) is required',
      );
      expect(() =>
        validateEnvelope(
          {
            to: 'test@example.com',
            from: 'sender@example.com',
          },
          'email',
        ),
      ).toThrow('Subject is required for email');
    });

    it('should throw on invalid email addresses', () => {
      expect(() =>
        validateEnvelope(
          {
            to: 'invalid',
            from: 'sender@example.com',
            subject: 'Test',
            html: 'Content',
          },
          'email',
        ),
      ).toThrow('Invalid email address: invalid');
    });

    it('should throw on invalid sender email address', () => {
      expect(() =>
        validateEnvelope(
          {
            to: 'test@example.com',
            from: 'invalid-sender',
            subject: 'Test',
            html: 'Content',
          },
          'email',
        ),
      ).toThrow('Invalid sender email address: invalid-sender');
    });

    it('should throw on invalid phone numbers', () => {
      expect(() =>
        validateEnvelope(
          {
            to: '123',
            from: '+14155551111',
            text: 'SMS',
          },
          'sms',
        ),
      ).toThrow('Invalid phone number: 123');
    });

    it('should throw on invalid sender phone number', () => {
      expect(() =>
        validateEnvelope(
          {
            to: '+14155552222',
            from: 'invalid-phone',
            text: 'SMS',
          },
          'sms',
        ),
      ).toThrow('Invalid sender phone number: invalid-phone');
    });

    it('should require content', () => {
      expect(() =>
        validateEnvelope(
          {
            to: 'test@example.com',
            from: 'sender@example.com',
            subject: 'Test',
          },
          'email',
        ),
      ).toThrow('Message content (html or text) is required');
    });

    it('should validate unknown transport class without email/phone validation', () => {
      // This tests the implicit else branch at line 66 when transportClass is not email/sms/call
      expect(() =>
        validateEnvelope(
          {
            to: 'any-destination',
            from: 'any-source',
            html: 'Content',
          },
          'webhook' as any,
        ),
      ).not.toThrow();

      // Should still require content even for unknown transport class
      expect(() =>
        validateEnvelope(
          {
            to: 'any-destination',
            from: 'any-source',
          },
          'webhook' as any,
        ),
      ).toThrow('Message content (html or text) is required');
    });
  });
});
