import getTransportClass from '../src/utils';

describe('getTransportClass', () => {
  it('should return email for email transports', () => {
    expect(getTransportClass('ses')).toBe('email');
    expect(getTransportClass('mailgun')).toBe('email');
    expect(getTransportClass('mailchimp')).toBe('email');
    expect(getTransportClass('smtp')).toBe('email');
    expect(getTransportClass('sendgrid')).toBe('email');
  });

  it('should return sms for SMS transports', () => {
    expect(getTransportClass('twilioSMS')).toBe('sms');
    expect(getTransportClass('telnyxSMS')).toBe('sms');
    expect(getTransportClass('sns')).toBe('sms');
  });

  it('should return call for voice transports', () => {
    expect(getTransportClass('twilioCall')).toBe('call');
  });

  it('should return email as default for unknown transports', () => {
    expect(getTransportClass('unknown')).toBe('email');
    expect(getTransportClass('')).toBe('email');
  });
});