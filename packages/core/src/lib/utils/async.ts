/**
 * waitWithTimeout
 *
 * Small helper that races a promise against a timeout. Useful when
 * waiting for external events (postMessage peer discovery, network responses)
 * that may never resolve in some environments — avoids leaving the page
 * stuck waiting indefinitely.
 *
 * Example: `await waitWithTimeout(messager.whenPeerDiscovered(), 15000)`
 */
export const waitWithTimeout = async <T>(p: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    p,
    new Promise<T>((_res, rej) => {
      timer = setTimeout(() => rej(new Error('timeout')), ms);
    }),
  ]).finally(() => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  });
};

export default waitWithTimeout;
