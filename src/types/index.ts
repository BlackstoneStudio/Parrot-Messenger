import Mail from 'nodemailer/lib/mailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import { voices } from '../constants/voices';

type Attachment =
  | Mail.Attachment // ses and smtp
  | { filename: string; data: string } // mailgun
  | { content: string; name: string; type: string } // mailchimp
  | {
      content: string;
      filename: string;
      type: string;
      disposition: string;
    }; // sendgrid

export type Envelope = {
  from?: string;
  to?: string;
  subject?: string;
  html?: string;
  text?: string;
  voice?: keyof typeof voices;
  attachments?: Attachment[];
};
export interface GenericTransport<T extends unknown = {}> {
  transport: T;
  send(envelope: Envelope): Promise<void>;
}

export type Defaults = {
  defaults?: Envelope;
};
export interface AWSSESConfig extends Defaults {
  auth: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}
export interface AWSSNS extends Defaults {
  auth: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  smsType?: 'Transactional' | 'Promotional';
}

export interface TwilioCall extends Defaults {
  auth: {
    sid: string;
    token: string;
  };
}
export interface TwilioSMS extends Defaults {
  auth: {
    sid: string;
    token: string;
  };
}
export interface TelnyxSMS extends Defaults {
  auth: {
    apiKey: string;
  };
}
export interface Mailchimp extends Defaults {
  auth: {
    apiKey: string;
  };
}
export interface Sendgrid extends Defaults {
  auth: {
    apiKey: string;
  };
}

export interface Mailgun extends Defaults {
  auth: {
    apiKey: string;
    domain: string;
  };
}

export interface SMTP extends Defaults {
  auth: SMTPTransport.Options;
}

interface TransportGeneric<N extends string, C extends 'email' | 'sms' | 'call', S extends {}> {
  name: N;
  class: C;
  settings: S;
}

export type Transport =
  | TransportGeneric<'ses', 'email', AWSSESConfig>
  | TransportGeneric<'sns', 'sms', AWSSNS>
  | TransportGeneric<'twilioSMS', 'sms', TwilioSMS>
  | TransportGeneric<'telnyxSMS', 'sms', TelnyxSMS>
  | TransportGeneric<'twilioCall', 'call', TwilioCall>
  | TransportGeneric<'mailchimp', 'email', Mailchimp>
  | TransportGeneric<'mailgun', 'email', Mailgun>
  | TransportGeneric<'sendgrid', 'email', Sendgrid>
  | TransportGeneric<'smtp', 'email', SMTP>;

export type Settings = {
  defaultClass?: string;
  transports: Transport[];
};

export type ParrotSettings = {
  defaultClass?: string;
  transports: Omit<Transport, 'class'>[];
  templateUrlValidation?: {
    allowedProtocols?: string[];
    allowedHosts?: string[];
    allowedPorts?: number[];
    blockPrivateIPs?: boolean;
    timeout?: number;
  };
};

export interface Mailer<T> {
  send(
    message: Envelope,
    transport?: Omit<Transport, 'settings'> | Omit<Transport, 'settings'>[],
  ): void;
  templates: T;
}
