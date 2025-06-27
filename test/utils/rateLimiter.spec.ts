import { RateLimiter } from '../../src/utils/rateLimiter';

// Helper to avoid eslint error with promise executor return
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1000); // 3 requests per second
  });

  it('should use default values when constructor called without parameters', () => {
    const defaultLimiter = new RateLimiter();
    // Default is 10 requests per 60000ms
    // Make 10 requests - should all pass
    for (let i = 0; i < 10; i += 1) {
      expect(defaultLimiter.tryRequest('key1')).toBe(true);
    }
    // 11th request should fail
    expect(defaultLimiter.tryRequest('key1')).toBe(false);
  });

  it('should allow requests within limit', () => {
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(false);
  });

  it('should track different keys separately', () => {
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);

    expect(rateLimiter.tryRequest('key2')).toBe(true);
    expect(rateLimiter.tryRequest('key2')).toBe(true);
    expect(rateLimiter.tryRequest('key2')).toBe(true);

    expect(rateLimiter.tryRequest('key1')).toBe(false);
    expect(rateLimiter.tryRequest('key2')).toBe(false);
  });

  it('should reset after time window', async () => {
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(true);
    expect(rateLimiter.tryRequest('key1')).toBe(false);

    await wait(1100);

    expect(rateLimiter.tryRequest('key1')).toBe(true);
  });

  it('should get remaining requests', () => {
    expect(rateLimiter.getRemainingRequests('key1')).toBe(3);

    rateLimiter.tryRequest('key1');
    expect(rateLimiter.getRemainingRequests('key1')).toBe(2);

    rateLimiter.tryRequest('key1');
    expect(rateLimiter.getRemainingRequests('key1')).toBe(1);

    rateLimiter.tryRequest('key1');
    expect(rateLimiter.getRemainingRequests('key1')).toBe(0);

    rateLimiter.tryRequest('key1');
    expect(rateLimiter.getRemainingRequests('key1')).toBe(0);
  });

  it('should get reset time', async () => {
    rateLimiter.tryRequest('key1');

    const resetTime = rateLimiter.getResetTime('key1');
    expect(resetTime).toBeGreaterThan(900);
    expect(resetTime).toBeLessThanOrEqual(1000);

    await wait(500);

    const newResetTime = rateLimiter.getResetTime('key1');
    expect(newResetTime).toBeGreaterThan(400);
    expect(newResetTime).toBeLessThanOrEqual(500);
  });

  it('should return 0 reset time for empty requests array', () => {
    // Test the branch at line 54 where requests array is empty
    const resetTime = rateLimiter.getResetTime('nonexistent-key');
    expect(resetTime).toBe(0);
  });

  it('should clear all data', () => {
    rateLimiter.tryRequest('key1');
    rateLimiter.tryRequest('key2');

    expect(rateLimiter.getRemainingRequests('key1')).toBe(2);
    expect(rateLimiter.getRemainingRequests('key2')).toBe(2);

    rateLimiter.clear();

    expect(rateLimiter.getRemainingRequests('key1')).toBe(3);
    expect(rateLimiter.getRemainingRequests('key2')).toBe(3);
  });

  it('should cleanup old entries', async () => {
    rateLimiter.tryRequest('key1');
    rateLimiter.tryRequest('key2');

    await wait(1100);

    rateLimiter.tryRequest('key3');

    // Before cleanup, all keys might still be in memory
    rateLimiter.cleanup();

    // After cleanup, old entries should be removed
    expect(rateLimiter.getRemainingRequests('key1')).toBe(3);
    expect(rateLimiter.getRemainingRequests('key2')).toBe(3);
    expect(rateLimiter.getRemainingRequests('key3')).toBe(2);
  });

  it('should handle sliding window correctly', async () => {
    const limiter = new RateLimiter(3, 2000); // 3 requests per 2 seconds

    // Make 3 requests at different times
    expect(limiter.tryRequest('key1')).toBe(true);

    await wait(500);
    expect(limiter.tryRequest('key1')).toBe(true);

    await wait(500);
    expect(limiter.tryRequest('key1')).toBe(true);

    // Should be blocked
    expect(limiter.tryRequest('key1')).toBe(false);

    // Wait for first request to expire
    await wait(1100);

    // Should allow one more
    expect(limiter.tryRequest('key1')).toBe(true);

    // Should be blocked again
    expect(limiter.tryRequest('key1')).toBe(false);
  });
});
