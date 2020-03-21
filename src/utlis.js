/**
 *  Get the default class for a transport
 * @param name {string}
 * @returns {string}
 */
const getTransportClass = (name) => {
  let defaultClass = 'unknown';
  const emailTransports = ['ses', 'mailgun', 'smtp'];
  const smsTransports = ['twilioSMS'];
  const voiceTransports = ['twilioCall'];

  if (emailTransports.indexOf(name) !== -1) defaultClass = 'email';
  if (smsTransports.indexOf(name) !== -1) defaultClass = 'sms';
  if (voiceTransports.indexOf(name) !== -1) defaultClass = 'call';

  return defaultClass;
};

export {
  getTransportClass,
};
