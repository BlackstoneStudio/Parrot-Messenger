// eslint-disable-next-line import/prefer-default-export
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  private maxRequests: number;

  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request is allowed and update the rate limit
   * @param key - The key to rate limit (e.g., URL, user ID, etc.)
   * @returns true if the request is allowed, false if rate limited
   */
  tryRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      // Update the map with only valid requests
      this.requests.set(key, validRequests);
      return false;
    }

    // Add the new request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  /**
   * Get the number of remaining requests for a key
   */
  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Get the time until the rate limit resets for a key
   */
  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) {
      return 0;
    }

    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    Array.from(this.requests.entries()).forEach(([key, requests]) => {
      const validRequests = requests.filter((time) => now - time < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    });
  }
}
