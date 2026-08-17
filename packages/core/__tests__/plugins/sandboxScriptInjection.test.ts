// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initStripeIframe, STRIPE_SDK_URL } from '../../src/plugins/Stripe/index';
import { initBraintreeIframe, BRAINTREE_DROPIN_SDK_URL } from '../../src/plugins/Braintree/index';
import { resetGatewayScriptCache } from '../../src/lib/utils/loadGatewayScript';

/**
 * The sandbox page is configured from its URL hash fragment, which is fully
 * attacker-controllable in a crafted link. These cases pin the invariant that
 * no value from that fragment can become a <script src> in the payment page.
 */

const ATTACKER_URL = 'https://attacker.example/skimmer.js';

/** Intercepted script elements — appending for real would trigger a network fetch. */
let appended: HTMLScriptElement[] = [];

const srcs = (): string[] => appended.map((s) => s.getAttribute('src') ?? '');

/** Dispatches an INITIALIZE that the plugin's PostMessageHelper will accept. */
const sendInitialize = async (channelId: string, payload: Record<string, unknown>) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { type: 'INITIALIZE', payload: { action: 'initialize', ...payload }, channelId },
      origin: window.location.origin,
    }),
  );
  // Let the async subscriber run up to its first await on script loading.
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => {
  resetGatewayScriptCache();
  appended = [];
  document.body.replaceChildren();
  // PostMessageHelper's peer discovery walks window.parent.frames, which the
  // test DOM does not populate. An empty list is the correct standalone shape.
  if (!window.parent.frames) {
    Object.defineProperty(window, 'frames', { value: [], configurable: true });
  }
  vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
    appended.push(node as unknown as HTMLScriptElement);
    return node;
  });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('initStripeIframe', () => {
  it('ignores a scriptSrc supplied in the hash fragment', async () => {
    initStripeIframe(
      new URLSearchParams({ channelId: 'ch-stripe', pk: 'pk_test_123', scriptSrc: ATTACKER_URL }),
    );

    await sendInitialize('ch-stripe', { pk: 'pk_test_123' });

    expect(srcs()).not.toContain(ATTACKER_URL);
    expect(srcs()).toEqual([STRIPE_SDK_URL]);
  });

  it('loads no script at all when the publishable key is rejected', async () => {
    initStripeIframe(
      new URLSearchParams({ channelId: 'ch-stripe-bad', pk: 'not-a-key', scriptSrc: ATTACKER_URL }),
    );

    await sendInitialize('ch-stripe-bad', { pk: 'not-a-key' });

    expect(appended).toEqual([]);
  });
});

describe('initBraintreeIframe', () => {
  it('ignores a scriptSrc supplied in the hash fragment', async () => {
    document.body.innerHTML = '<div id="checkout"></div>';
    initBraintreeIframe(
      new URLSearchParams({ channelId: 'ch-bt', tk: 'sandbox_abc', scriptSrc: ATTACKER_URL }),
    );

    await sendInitialize('ch-bt', { clientToken: 'fake-client-token' });

    expect(srcs()).not.toContain(ATTACKER_URL);
    expect(srcs()).toEqual([BRAINTREE_DROPIN_SDK_URL]);
  });

  it('loads no script at all when no authorization is available', async () => {
    document.body.innerHTML = '<div id="checkout"></div>';
    initBraintreeIframe(new URLSearchParams({ channelId: 'ch-bt-bad', scriptSrc: ATTACKER_URL }));

    await sendInitialize('ch-bt-bad', {});

    expect(appended).toEqual([]);
  });
});
