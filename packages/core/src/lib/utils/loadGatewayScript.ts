/**
 * Script loader for payment-gateway SDKs.
 *
 * The payment sandbox page is configured entirely from the URL hash fragment,
 * which is attacker-controllable in a crafted link. Nothing sourced from that
 * fragment may ever reach a `<script src>`. This module is the only place in
 * the payment path that appends a script element, and it refuses any URL whose
 * origin is not a known gateway SDK host.
 *
 * Callers pass a module-level constant (see each plugin's `*_SDK_URL`), never a
 * value read from `params`.
 */

/**
 * Origins permitted to serve payment SDK scripts into the sandbox page.
 *
 * Keep this list minimal: an entry here is a host allowed to run script in the
 * same document tree as the gateway's card-capture iframe.
 */
export const ALLOWED_GATEWAY_SDK_ORIGINS: readonly string[] = [
  'https://js.stripe.com',
  'https://js.braintreegateway.com',
  'https://js.authorize.net',
  'https://jstest.authorize.net',
];

/**
 * True when `src` is an absolute https URL served from an allowlisted gateway
 * SDK origin. Relative URLs, other schemes (including `javascript:` and
 * `data:`), and unknown hosts all return false.
 */
export const isAllowedGatewayScriptUrl = (src: string): boolean => {
  let url: URL;
  try {
    // No base — a relative URL must not resolve against the sandbox page.
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  return ALLOWED_GATEWAY_SDK_ORIGINS.includes(url.origin);
};

/** In-flight and settled loads, keyed by URL, so repeated calls reuse one tag. */
const inFlight = new Map<string, Promise<void>>();

/**
 * Appends a gateway SDK `<script>` to `document.head` and resolves when it
 * loads. Rejects without touching the DOM if `src` is not allowlisted.
 *
 * Repeated calls for the same URL share a single script element.
 */
export const loadGatewayScript = (src: string): Promise<void> => {
  if (!isAllowedGatewayScriptUrl(src)) {
    return Promise.reject(
      new Error(
        `Refusing to load script from a non-allowlisted origin: ${src}. ` +
        `Allowed origins: ${ALLOWED_GATEWAY_SDK_ORIGINS.join(', ')}.`,
      ),
    );
  }

  const existing = inFlight.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      // A failed load is retryable — drop the cache entry so a later attempt
      // creates a fresh element instead of replaying the rejection.
      inFlight.delete(src);
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });

  inFlight.set(src, promise);
  return promise;
};

/** Test seam — clears the shared-load cache between cases. */
export const resetGatewayScriptCache = (): void => {
  inFlight.clear();
};
