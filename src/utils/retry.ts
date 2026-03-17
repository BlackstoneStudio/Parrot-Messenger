export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 5000,
  factor: 2,
  shouldRetry: (error: any) => {
    // Don't retry on 4xx client errors
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      return false;
    }
    // Retry on network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }
    // Retry on 5xx status codes
    if (error.response && error.response.status >= 500) {
      return true;
    }
    // Default to retry for other errors (network issues, timeouts, etc.)
    return true;
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  transportName: string,
  options: RetryOptions = {},
): Promise<T> {
  // Filter out undefined values from options
  const cleanOptions = Object.entries(options).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof RetryOptions] = value;
    }
    return acc;
  }, {} as RetryOptions);

  const opts = { ...DEFAULT_OPTIONS, ...cleanOptions };

  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      if (attempt >= opts.maxRetries || !opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(opts.initialDelay * opts.factor ** attempt, opts.maxDelay);

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay * (0.5 + Math.random() * 0.5);

      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, jitteredDelay));

      attempt += 1;
    }
  }
}
