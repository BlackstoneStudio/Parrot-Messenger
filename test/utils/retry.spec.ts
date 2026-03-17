import { withRetry } from '../../src/utils/retry';

describe('retry utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await withRetry(fn, 'test-transport');

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('success');

    const result = await withRetry(fn, 'test-transport', {
      initialDelay: 10,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry with exponential backoff', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success');

    const start = Date.now();
    const result = await withRetry(fn, 'test-transport', {
      initialDelay: 50,
      factor: 2,
      maxDelay: 200,
    });
    const duration = Date.now() - start;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
    // Should take at least some time for delays (allow for timing variations in CI)
    // Initial delay (50ms) + second delay (100ms) = 150ms total, but allow for faster execution
    expect(duration).toBeGreaterThanOrEqual(80);
  });

  it('should throw after max retries', async () => {
    const error = new Error('Persistent error');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(
      withRetry(fn, 'test-transport', { maxRetries: 2, initialDelay: 10 }),
    ).rejects.toThrow('Persistent error');

    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should not retry on client errors (4xx)', async () => {
    const error = { response: { status: 400 } };
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn, 'test-transport')).rejects.toEqual(error);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on server errors (5xx)', async () => {
    const error = { response: { status: 500 } };
    const fn = jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');

    const result = await withRetry(fn, 'test-transport', {
      initialDelay: 10,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on network errors', async () => {
    const errors = [{ code: 'ECONNREFUSED' }, { code: 'ETIMEDOUT' }, { code: 'ENOTFOUND' }];

    // eslint-disable-next-line no-restricted-syntax
    for (const error of errors) {
      const fn = jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');

      // eslint-disable-next-line no-await-in-loop
      const result = await withRetry(fn, 'test-transport', {
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
      fn.mockClear();
    }
  });

  it('should respect maxDelay option', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockRejectedValueOnce(new Error('Error 3'))
      .mockResolvedValueOnce('success');

    const start = Date.now();
    const result = await withRetry(fn, 'test-transport', {
      initialDelay: 100,
      factor: 10, // Would be 100, 1000, 10000 without maxDelay
      maxDelay: 200,
      maxRetries: 3,
    });
    const duration = Date.now() - start;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(4);
    // Should not exceed initialDelay + maxDelay * 3 = 100 + 600 = 700ms (plus some jitter)
    expect(duration).toBeLessThan(1000);
  });

  it('should use custom shouldRetry function', async () => {
    const customError = { customField: 'retry-me' };
    const otherError = { customField: 'do-not-retry' };

    const fn = jest.fn().mockRejectedValueOnce(customError).mockRejectedValueOnce(otherError);

    await expect(
      withRetry(fn, 'test-transport', {
        initialDelay: 10,
        shouldRetry: (error) => error.customField === 'retry-me',
      }),
    ).rejects.toEqual(otherError);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
