import { ConfigurationOptions } from 'aws-sdk';

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

interface TransportGeneric<
	N extends string,
	C extends 'email'|'sms'|'call',
	S extends {}
> {
	name: N,
	class: C,
	setings: S
}

export type Transport =
	| TransportGeneric<'ses', 'email', AWSSESConfig>
	| TransportGeneric<'mailjetEmail', 'email', MailjetEmail>
	| TransportGeneric<'mailjetSMS', 'sms', MailjetSMS>
	| TransportGeneric<'twilioSMS', 'sms', {}>
	| TransportGeneric<'twilioCall', 'call', {}>
	| TransportGeneric<'mailchimp', 'email', {}>
	| TransportGeneric<'mailgun', 'email', {}>
	| TransportGeneric<'sendgrid', 'email', {}>
	| TransportGeneric<'smtp', 'email', {}>

export type Settings = {
	defaultClass?: string
	transports: Omit<Transport, 'class'>[]
}
