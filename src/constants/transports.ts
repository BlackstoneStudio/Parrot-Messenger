/**
 * Transport names as const assertion for better type safety
 */
export const TRANSPORT_NAMES = {
  // Email transports
  SES: 'ses',
  SMTP: 'smtp',
  MAILGUN: 'mailgun',
  MAILCHIMP: 'mailchimp',
  SENDGRID: 'sendgrid',
  
  // SMS transports
  SNS: 'sns',
  TWILIO_SMS: 'twilioSMS',
  TELNYX_SMS: 'telnyxSMS',
  
  // Call transports
  TWILIO_CALL: 'twilioCall',
} as const;

/**
 * Transport classes
 */
export const TRANSPORT_CLASSES = {
  EMAIL: 'email',
  SMS: 'sms',
  CALL: 'call',
} as const;

/**
 * Transport classification by name
 */
export const TRANSPORT_CLASSIFICATION = {
  email: [
    TRANSPORT_NAMES.SES,
    TRANSPORT_NAMES.MAILGUN,
    TRANSPORT_NAMES.MAILCHIMP,
    TRANSPORT_NAMES.SMTP,
    TRANSPORT_NAMES.SENDGRID,
  ],
  sms: [
    TRANSPORT_NAMES.TWILIO_SMS,
    TRANSPORT_NAMES.TELNYX_SMS,
    TRANSPORT_NAMES.SNS,
  ],
  call: [
    TRANSPORT_NAMES.TWILIO_CALL,
  ],
} as const;

// Type exports
export type TransportName = typeof TRANSPORT_NAMES[keyof typeof TRANSPORT_NAMES];
export type TransportClass = typeof TRANSPORT_CLASSES[keyof typeof TRANSPORT_CLASSES];