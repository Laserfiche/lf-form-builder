import { describe, expect, it, vi } from 'vitest';
import { throttle } from '../../src/lib/utils/throttle';

describe('throttle', () => {
  it('calls callback immediately on first invocation', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('arg1', 'arg2');

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('prevents callback from being called again during delay', async () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('first');
    throttled('second');
    throttled('third');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');
  });

  it('allows callback to be called again after delay expires', async () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 50);

    throttled('first');
    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for delay to pass
    await new Promise((resolve) => setTimeout(resolve, 60));

    throttled('second');
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('second');
  });

  it('uses default delay of 1000ms', async () => {
    const callback = vi.fn();
    const throttled = throttle(callback);

    throttled('first');
    throttled('second');
    expect(callback).toHaveBeenCalledTimes(1);

    // After default 1000ms, should allow another call
    await new Promise((resolve) => setTimeout(resolve, 1010));
    throttled('third');

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('passes multiple arguments to callback', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled(1, 'two', { three: 3 });

    expect(callback).toHaveBeenCalledWith(1, 'two', { three: 3 });
  });

  it('handles callback that throws error', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Test error');
    });
    const throttled = throttle(errorCallback, 100);

    expect(() => throttled()).toThrow('Test error');
  });
});
