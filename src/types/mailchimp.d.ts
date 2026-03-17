declare module '@mailchimp/mailchimp_transactional/src/index' {
  interface MailchimpClient {
    messages: {
      send: (request: {
        key?: string;
        message: {
          from_email: string;
          to: Array<{ email: string; type: string }>;
          subject?: string;
          html?: string;
          text?: string;
          attachments?: Array<{
            type: string;
            name: string;
            content: string;
          }>;
        };
      }) => Promise<Array<{ email: string; status: string; reject_reason?: string }>>;
    };
  }

  function mailchimp(apiKey: string): MailchimpClient;
  export = mailchimp;
}
