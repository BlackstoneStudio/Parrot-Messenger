import { SimpleCache } from '../../src/utils/cache';

// Helper to avoid eslint error with promise executor return
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('SimpleCache', () => {
  let cache: SimpleCache<string>;

  beforeEach(() => {
    cache = new SimpleCache<string>(1000); // 1 second TTL for tests
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should respect TTL', async () => {
    cache.set('key1', 'value1', 100); // 100ms TTL
    expect(cache.get('key1')).toBe('value1');

    await wait(150);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should use default TTL when not specified', async () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    await wait(500);
    expect(cache.get('key1')).toBe('value1');

    await wait(600);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should delete entries', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);

    const deleted = cache.delete('key1');
    expect(deleted).toBe(true);
    expect(cache.has('key1')).toBe(false);

    const deletedAgain = cache.delete('key1');
    expect(deletedAgain).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    cache.clear();

    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
    expect(cache.has('key3')).toBe(false);
  });

  it('should cleanup expired entries', async () => {
    cache.set('key1', 'value1', 100);
    cache.set('key2', 'value2', 200);
    cache.set('key3', 'value3', 300);

    expect(cache.size()).toBe(3);

    await wait(150);
    expect(cache.size()).toBe(2); // key1 should be expired

    await wait(100);
    expect(cache.size()).toBe(1); // key2 should be expired

    await wait(100);
    expect(cache.size()).toBe(0); // key3 should be expired
  });

  it('should handle has() with expired entries', async () => {
    cache.set('key1', 'value1', 100);
    expect(cache.has('key1')).toBe(true);

    await wait(150);
    expect(cache.has('key1')).toBe(false);
  });

  it('should support different types', () => {
    const objCache = new SimpleCache<{ name: string }>();
    const obj = { name: 'test' };

    objCache.set('key1', obj);
    expect(objCache.get('key1')).toEqual(obj);
    expect(objCache.get('key1')).toBe(obj); // Same reference
  });
});
