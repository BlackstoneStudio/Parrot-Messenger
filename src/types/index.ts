import { ConfigurationOptions } from 'aws-sdk';
import * as mailgun from 'mailgun-js';
import SMTPTransport = require('nodemailer/lib/smtp-transport');

export type Envelope = {
	from?: string
	to?: string
	subject?: string
	html?: string
}
export interface GenericTransport<T extends unknown = {}> {
	transport: T
	send(envelope: Envelope): Promise<void>
}

export type Defaults = {
	defaults?: Envelope
}
export interface AWSSESConfig extends Defaults {
	auth: ConfigurationOptions
}

export interface MailjetEmail extends Defaults {
	auth: {
		apiKeyPublic: string
		apiKeyPrivate: string
	}
}
export interface MailjetSMS extends Defaults {
	auth: {
		apiKey: string
	}
}
export interface TwilioCall extends Defaults {
	auth: {
		sid: string
		token: string
	}
}
export interface TwilioSMS extends Defaults {
	auth: {
		sid: string
		token: string
	}
}
export interface Mailchimp extends Defaults {
	auth: {
		apiKey: string
	}
}
export interface Sendgrid extends Defaults {
	auth: {
		apiKey: string
	}
}

export interface Mailgun extends Defaults {
	auth: mailgun.ConstructorParams
}

export interface SMTP extends Defaults {
	auth: SMTPTransport.Options
}

interface TransportGeneric<
	N extends string,
	C extends 'email'|'sms'|'call',
	S extends {}
> {
	name: N,
	class: C,
	settings: S
}

export type Transport =
	| TransportGeneric<'ses', 'email', AWSSESConfig>
	| TransportGeneric<'mailjetEmail', 'email', MailjetEmail>
	| TransportGeneric<'mailjetSMS', 'sms', MailjetSMS>
	| TransportGeneric<'twilioSMS', 'sms', TwilioSMS>
	| TransportGeneric<'twilioCall', 'call', TwilioCall>
	| TransportGeneric<'mailchimp', 'email', Mailchimp>
	| TransportGeneric<'mailgun', 'email', Mailgun>
	| TransportGeneric<'sendgrid', 'email', Sendgrid>
	| TransportGeneric<'smtp', 'email', SMTP>

export type Settings = {
	defaultClass?: string
	transports: Transport[]
}

export type ParrotSettings = {
	defaultClass?: string
	transports: Omit<Transport, 'class'>[]
}

export interface Mailer<T> {
	send(message: Envelope, transport?: Omit<Transport, 'settings'>|Omit<Transport, 'settings'>[]): void
	templates: T
}
