export default (name: string): 'email'|'sms'|'call' => {
  let defaultClass: 'email'|'sms'|'call' = 'email';
  const emailTransports = ['ses', 'mailgun', 'mailchimp', 'smtp', 'sendgrid'];
  const smsTransports = ['twilioSMS', 'mailjetSMS', 'telnyxSMS', 'sns'];
  const voiceTransports = ['twilioCall'];

  if (emailTransports.indexOf(name) !== -1) defaultClass = 'email';
  if (smsTransports.indexOf(name) !== -1) defaultClass = 'sms';
  if (voiceTransports.indexOf(name) !== -1) defaultClass = 'call';

  return defaultClass;
};
