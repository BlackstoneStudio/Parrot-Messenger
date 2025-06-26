import { TRANSPORT_CLASSIFICATION, TransportClass } from './constants/transports';

export default (name: string): TransportClass => {
  if (TRANSPORT_CLASSIFICATION.email.includes(name as any)) return 'email';
  if (TRANSPORT_CLASSIFICATION.sms.includes(name as any)) return 'sms';
  if (TRANSPORT_CLASSIFICATION.call.includes(name as any)) return 'call';

  // Default to email if transport name is not recognized
  return 'email';
};
