import { ConfigurationOptions } from 'aws-sdk';
import { Transporter } from 'nodemailer';

export class GenericTransport {
	public transport: Transporter
}

export type Envelope = {
	from?: string,
	to?: string,
	subject?: string
	html?: string
}

export type Defaults = {
	defaults?: Envelope
}

export interface AWSSESConfig extends Defaults {
	auth: ConfigurationOptions
}

export interface MailjetEmail extends Defaults {
	auth: {
		apiKeyPublic: string,
		apiKeyPrivate: string
	}
}

export type Transport =
	| {
		name: 'ses'
		class: 'email'
		settings: AWSSESConfig
	}
	| {
		name: 'mailjetEmail'
		class: 'email'
		settings: MailjetEmail
	}
	| {
		name: 'mailjetSMS'
		class: 'sms'
		settings: {}
	}
	| {
		name: 'twilioSMS'
		class: 'sms'
		settings: {}
	}
	| {
		name: 'twilioCall'
		class: 'call'
		settings: {}
	}
	| {
		name: 'mailchimp'
		class: 'email'
		settings: {}
	}
	| {
		name: 'mailgun'
		class: 'email'
		settings: {}
	}
	| {
		name: 'sendgrid'
		class: 'email'
		settings: {}
	}
	| {
		name: 'smtp'
		class: 'email'
		settings: {}
	}

export type Settings = {
	defaultClass: string
	transports: Transport[],
}
