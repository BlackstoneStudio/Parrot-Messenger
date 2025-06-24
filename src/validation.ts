export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{5,14}$/;
  return phoneRegex.test(phone);
};

export const sanitizeHtml = (html: string): string => html
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export const validateEnvelope = (envelope: {
  to?: string;
  from?: string;
  subject?: string;
  html?: string;
  text?: string;
}, transportClass: 'email' | 'sms' | 'call'): void => {
  if (!envelope.to) {
    throw new Error('Recipient (to) is required');
  }

  if (!envelope.from) {
    throw new Error('Sender (from) is required');
  }

  if (transportClass === 'email') {
    if (!isValidEmail(envelope.to)) {
      throw new Error(`Invalid email address: ${envelope.to}`);
    }
    if (!isValidEmail(envelope.from)) {
      throw new Error(`Invalid sender email address: ${envelope.from}`);
    }
    if (!envelope.subject) {
      throw new Error('Subject is required for email');
    }
  } else if (transportClass === 'sms' || transportClass === 'call') {
    if (!isValidPhoneNumber(envelope.to)) {
      throw new Error(`Invalid phone number: ${envelope.to}`);
    }
    if (!isValidPhoneNumber(envelope.from)) {
      throw new Error(`Invalid sender phone number: ${envelope.from}`);
    }
  }

  if (!envelope.html && !envelope.text) {
    throw new Error('Message content (html or text) is required');
  }
};
