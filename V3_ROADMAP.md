# Parrot Messenger v3.0.0 Roadmap

## Vision

Parrot Messenger v2 solved **sending** — a unified interface across 13 providers and 4 message classes. v3 evolves Parrot from a messaging library into **messaging infrastructure**: observable, resilient, extensible, and production-hardened at scale.

## Current State (v2.2.0)

### What's Strong

- Clean transport abstraction — adding providers is trivial
- Consistent API surface across email, SMS, call, and chat
- 305 tests at 95%+ coverage with strong CI discipline
- TypeScript-first with real types
- 0 npm audit vulnerabilities
- Built-in MockTransport for testing (`parrot-messenger/testing`)

### What's Missing

- Messages go into a black box — no delivery status, no logging, no metrics
- No fallback chains between providers
- No plugin/middleware system (the `src/core/plugin.ts` exists at 0% coverage)
- No queue or batch support — every send is synchronous and standalone
- Errors lack provider context and actionable guidance

---

## Work Breakdown

### Phase 1: Observability

**Goal:** Make every message traceable from send to delivery.

#### 1.1 — Event Emitter

Add lifecycle events to the Parrot instance so teams can hook in metrics, alerting, and auditing without modifying internals.

```typescript
parrot.on('send', ({ envelope, transport, duration }) => {
  metrics.increment('messages.sent', { provider: transport.name });
});

parrot.on('error', ({ envelope, transport, error }) => {
  logger.error('Send failed', { provider: transport.name, error: error.message });
});

parrot.on('retry', ({ envelope, transport, attempt, maxRetries }) => {
  logger.warn(`Retry ${attempt}/${maxRetries}`, { provider: transport.name });
});
```

**Events:**

- `beforeSend` — envelope + transport, before validation
- `send` — successful send with duration
- `error` — failed send with error context
- `retry` — retry attempt with count
- `fallback` — when falling back to another provider (Phase 2)

#### 1.2 — Structured Logging

Pluggable logger interface compatible with `pino`, `winston`, or any logger that implements `{ info, warn, error, debug }`.

```typescript
const parrot = new Parrot({
  transports: [...],
  logger: pino({ level: 'info' }),
});
```

Logs at each step: envelope validation, transport selection, provider request, retry attempts, success/failure.

**Default:** No logging (silent). Opt-in only.

#### 1.3 — Debug Mode

```typescript
const parrot = new Parrot({
  transports: [...],
  debug: true, // Logs everything to console
});
```

Shorthand for a built-in console logger at `debug` level. For development and troubleshooting only.

---

### Phase 2: Resilience

**Goal:** Messages get delivered even when providers go down.

#### 2.1 — Fallback Chains

Declarative provider fallback — the #1 reason teams adopt a unified messaging layer.

```typescript
const parrot = new Parrot({
  transports: [
    { name: 'sendgrid', priority: 1, settings: { ... } },
    { name: 'ses', priority: 2, settings: { ... } },
    { name: 'postmark', priority: 3, settings: { ... } },
  ],
  fallback: true, // Try next provider on failure
});
```

When `sendgrid` fails, automatically try `ses`. When `ses` fails, try `postmark`. All attempts are logged via the event emitter.

#### 2.2 — Circuit Breakers

If a provider fails repeatedly, stop sending to it temporarily and switch to fallback immediately.

```typescript
const parrot = new Parrot({
  transports: [...],
  circuitBreaker: {
    failureThreshold: 5,    // Open circuit after 5 consecutive failures
    resetTimeout: 30000,    // Try again after 30 seconds
  },
});
```

States: `closed` (normal) → `open` (failing, skip to fallback) → `half-open` (test one request).

#### 2.3 — Wire Rate Limiter into Send Path

`src/utils/rateLimiter.ts` exists but isn't connected to `send.ts`. Wire it in with per-provider rate limits.

```typescript
const parrot = new Parrot({
  transports: [
    {
      name: 'sendgrid',
      settings: { ... },
      rateLimit: { maxPerSecond: 100 },
    },
  ],
});
```

When the limit is hit: queue the message (if queue adapter is configured) or throw a clear `RateLimitError`.

#### 2.4 — Dead Letter Queue

Messages that fail all retries and fallbacks should go somewhere inspectable, not just throw and disappear.

```typescript
const parrot = new Parrot({
  transports: [...],
  deadLetterQueue: {
    handler: async (message, errors) => {
      await db.insert('failed_messages', { message, errors, timestamp: new Date() });
    },
  },
});
```

---

### Phase 3: Plugin System

**Goal:** Let the community extend Parrot without PRs.

#### 3.1 — Middleware Architecture

Plugins hook into the message lifecycle via middleware. Each plugin receives the context and calls `next()` to continue or throws to abort.

```typescript
interface ParrotPlugin {
  name: string;
  beforeSend?(ctx: SendContext, next: () => Promise<void>): Promise<void>;
  afterSend?(ctx: SendContext, next: () => Promise<void>): Promise<void>;
  onError?(ctx: ErrorContext, next: () => Promise<void>): Promise<void>;
}

parrot.use(myPlugin);
```

#### 3.2 — Built-in Plugins

Ship a few first-party plugins to prove the architecture and serve as examples:

| Plugin                              | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `@parrot-messenger/plugin-logging`  | Structured logging via pluggable logger                            |
| `@parrot-messenger/plugin-metrics`  | StatsD/Prometheus metrics emission                                 |
| `@parrot-messenger/plugin-dedup`    | Deduplicate messages within a TTL window                           |
| `@parrot-messenger/plugin-throttle` | Per-recipient throttling (e.g., max 3 emails/hour to same address) |

#### 3.3 — Remove or Replace `src/core/plugin.ts`

The current file is unused and untested. Replace it with the real plugin system or delete it entirely.

---

### Phase 4: Webhook Normalization

**Goal:** Close the loop — know if your message was delivered, opened, bounced, or clicked.

#### 4.1 — Unified Webhook Handler

Each provider sends delivery status via webhooks in a different format. Parrot should normalize them into a single event schema.

```typescript
import { createWebhookHandler } from 'parrot-messenger/webhooks';

const handler = createWebhookHandler({
  sendgrid: { signingSecret: process.env.SENDGRID_WEBHOOK_SECRET },
  postmark: {
    /* ... */
  },
  ses: {
    /* ... */
  },
});

// Express/Fastify/Next.js route
app.post('/webhooks/messaging', handler.express());

handler.on('delivered', (event) => {
  /* ... */
});
handler.on('bounced', (event) => {
  /* ... */
});
handler.on('opened', (event) => {
  /* ... */
});
handler.on('clicked', (event) => {
  /* ... */
});
handler.on('complained', (event) => {
  /* ... */
});
handler.on('failed', (event) => {
  /* ... */
});
```

#### 4.2 — Normalized Event Schema

```typescript
interface DeliveryEvent {
  id: string;
  provider: string;
  type: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'failed';
  recipient: string;
  timestamp: Date;
  metadata: Record<string, unknown>; // Provider-specific details
  raw: unknown; // Original webhook payload
}
```

---

### Phase 5: Async & Scale

**Goal:** Move from synchronous sends to production-grade message processing.

#### 5.1 — Queue Adapters

Plug in a queue backend so sends are enqueued and processed reliably with retries, backoff, and concurrency control.

```typescript
import { BullMQAdapter } from 'parrot-messenger/queues/bullmq';

const parrot = new Parrot({
  transports: [...],
  queue: new BullMQAdapter({
    connection: { host: 'localhost', port: 6379 },
    concurrency: 10,
  }),
});

// This now enqueues instead of sending immediately
await parrot.send(message, transport);
```

**Adapters to build:**

- `BullMQAdapter` (Redis) — most common in Node.js
- `SQSAdapter` (AWS) — for AWS-native teams
- `InMemoryAdapter` — for testing and development

#### 5.2 — Batch Sending

Send thousands of messages without opening thousands of concurrent connections.

```typescript
await parrot.sendBatch(
  [
    { to: 'alice@example.com', subject: 'Welcome', html: '...' },
    { to: 'bob@example.com', subject: 'Welcome', html: '...' },
    // ... 10,000 more
  ],
  { class: 'email', name: 'sendgrid' },
);
```

Uses provider-specific batch APIs where available (SendGrid, Mailgun), falls back to rate-limited sequential sends.

#### 5.3 — Scheduled Sends

```typescript
await parrot.send(message, transport, {
  sendAt: new Date('2026-04-01T09:00:00Z'),
});
```

Uses provider-native scheduling where supported (SendGrid, Postmark, Telnyx), falls back to queue-based delay.

---

### Phase 6: Developer Experience

#### 6.1 — Richer Errors

Errors should include provider name, request ID, and actionable guidance.

```typescript
TransportError: SendGrid rejected the request (403)
  Provider: sendgrid
  Request ID: sg-abc123
  Reason: The sender email is not verified
  Fix: Verify your sender at https://app.sendgrid.com/settings/sender_auth
  Docs: https://docs.sendgrid.com/for-developers/sending-email/sender-identity
```

#### 6.2 — Standalone Validation

```typescript
const result = parrot.validate(message, { class: 'email' });
// { valid: true } or { valid: false, errors: ['Missing required field: to'] }
```

Useful for API layers that want to validate before queuing.

#### 6.3 — Dry Run Mode

```typescript
const result = await parrot.send(message, transport, { dryRun: true });
// Returns: { transport: 'sendgrid', envelope: { ... }, wouldSend: true }
```

Shows what would happen without doing it. Useful for debugging routing logic.

---

### Phase 7: Documentation as a Product

#### 7.1 — Dedicated Docs Site

Not just a README. Each provider gets its own page with:

- Setup guide (account creation → first message)
- Config reference
- Common errors and fixes
- Migration notes from direct SDK usage

#### 7.2 — Recipes

Practical guides that show Parrot in context:

- "Send a welcome email on signup"
- "Verify phone number via OTP"
- "Send Slack alert on payment failure"
- "Set up email fallback: SendGrid → SES → SMTP"
- "Test messaging logic in Jest with MockTransport"

#### 7.3 — Provider Compatibility Matrix

| Feature     | SES | SendGrid | Postmark | Resend | Mailgun | Mailchimp | SMTP |
| ----------- | --- | -------- | -------- | ------ | ------- | --------- | ---- |
| Attachments | ✓   | ✓        | ✓        | ✓      | ✓       | ✓         | ✓    |
| CC/BCC      | ✓   | ✓        | ✓        | ✓      | ✓       | ✗         | ✓    |
| Templates   | ✗   | ✓        | ✓        | ✓      | ✓       | ✓         | ✗    |
| Scheduling  | ✗   | ✓        | ✓        | ✗      | ✓       | ✗         | ✗    |
| Webhooks    | ✓   | ✓        | ✓        | ✓      | ✓       | ✓         | ✗    |
| Batch       | ✓   | ✓        | ✓        | ✓      | ✓       | ✓         | ✗    |

---

## Versioning & Migration

**v3.0.0 Breaking Changes:**

- Node.js minimum raised to 22 (current LTS)
- Plugin system replaces the unused `src/core/plugin.ts`
- `send()` return type changes from `void` to `SendResult` (includes message ID, provider, duration)
- Transport settings may add optional fields (`priority`, `rateLimit`)
- Event emitter added to Parrot class (additive but changes class shape)

**Migration guide** will be published with clear before/after examples for each breaking change.

---

## Priority & Sequencing

| Phase            | Semver | Effort | Impact    | Dependencies           |
| ---------------- | ------ | ------ | --------- | ---------------------- |
| 1. Observability | 3.0.0  | Medium | High      | None                   |
| 2. Resilience    | 3.0.0  | Medium | Very High | Phase 1 (events)       |
| 3. Plugin System | 3.0.0  | Medium | High      | Phase 1 (hooks)        |
| 4. Webhooks      | 3.1.0  | Large  | High      | None                   |
| 5. Async & Scale | 3.2.0  | Large  | Very High | Phase 2 (rate limiter) |
| 6. DX Polish     | 3.0.0+ | Small  | Medium    | Ongoing                |
| 7. Docs Site     | 3.0.0+ | Medium | Very High | Ongoing                |

**Phases 1–3 ship together as v3.0.0** — they're interconnected (events feed into resilience, resilience feeds into plugins). Phases 4–5 are independent and ship as minor releases. Phases 6–7 are ongoing.

---

## Success Metrics

- **Adoption:** npm weekly downloads > 1,000
- **Reliability:** Zero reported message loss in production usage
- **Community:** 10+ GitHub stars, 3+ external contributors
- **Coverage:** Maintain 95%+ test coverage across all new code
- **Security:** Zero npm audit vulnerabilities at every release
