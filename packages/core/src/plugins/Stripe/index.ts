import { PostMessageHelper } from '../../lib/utils/postMessageHelper';
import { loadGatewayScript } from '../../lib/utils/loadGatewayScript';

/**
 * Messages exchanged between the Stripe embedded-checkout iframe
 * and the LF Form sandbox that hosts it.
 */
export type StripeMessages = {
  INITIALIZE: { action: 'initialize'; pk?: string; clientToken?: string; amount?: string; apiLoginId?: string; clientKey?: string };
  START_CHECKOUT: { key: string; sessionId?: string };
  COMPLETE_CHECKOUT: { result: string };
  ERROR: { message: string };
};

interface EmbeddedCheckout {
  mount: (selector: string) => void;
}
interface StripeInstance {
  initEmbeddedCheckout: (options: {
    fetchClientSecret: () => Promise<string>;
    onComplete?: () => void | Promise<void>;
  }) => Promise<EmbeddedCheckout>;
}
declare const Stripe: (publishableKey: string) => StripeInstance;

/**
 * The only URL this plugin will load the Stripe SDK from.
 *
 * Deliberately a module constant, not a parameter: `params` comes from the URL
 * hash fragment, which an attacker controls in a crafted link. A caller-supplied
 * script URL would execute arbitrary JavaScript in the same document tree as the
 * gateway's card-capture iframe.
 */
export const STRIPE_SDK_URL = 'https://js.stripe.com/clover/stripe.js';

/**
 * Initialise the Stripe embedded-checkout handler inside a sandbox iframe.
 *
 * Call this when `window.__lfSandboxMode === 'stripe-sandbox'`.
 * `params` should be `window.__lfSandboxParams` (set by sandbox.html before
 * the script is evaluated) and must contain at minimum `channelId` and `pk`.
 * The Stripe JS SDK is loaded from {@link STRIPE_SDK_URL}; the URL is not
 * configurable.
 */
export const initStripeIframe = (params: URLSearchParams): void => {
  const stripeChannelId = params.get('channelId') ?? 'empower2026-checkout';
  let currentSessionId: string | null = null;

  // Diagnostic: log where this iframe lives to verify peer-discovery targeting.
  const selfHref = (() => { try { return window.location.href; } catch { return '(cross-origin)'; } })();
  const parentHref = (() => { try { return window.parent.location.href; } catch { return '(cross-origin)'; } })();
  // eslint-disable-next-line no-console
  console.log('[Stripe] iframe mode — self:', selfHref, '| parent:', parentHref);

  const sandboxHandler = new PostMessageHelper<StripeMessages>(window.location.origin, {
    channelId: stripeChannelId,
    // Host shells emit unrelated messages; suppress noise.
    onInvalidMessage: () => {},
    peerDiscovery: true,
    // Default getSiblingFrames() finds the outer LF sandbox (a sibling child of
    // the same parent page) — the correct peer for PostMessageHelper discovery.
  });

  sandboxHandler.whenPeerDiscovered().then(
    // eslint-disable-next-line no-console
    () => console.log('[Stripe] peer discovered'),
    () => {},
  );

  const { resolve, promise: clientSecret } = Promise.withResolvers<string>();

  const unsubscribeInitialize = sandboxHandler.subscribe('INITIALIZE', async (payload) => {
    try {
      const stripePublishableKey = payload?.pk ?? params.get('pk') ?? undefined;
      if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
        await sandboxHandler.whenPeerDiscovered();
        sandboxHandler.send({
          type: 'ERROR',
          payload: { message: '[Stripe] Invalid publishable key. Provide pk param or set VITE_STRIPE_PUBLIC_KEY.' },
        });
        return;
      }

      await loadGatewayScript(STRIPE_SDK_URL);

      const checkout = await Stripe(stripePublishableKey).initEmbeddedCheckout({
        fetchClientSecret: () => clientSecret,
        onComplete: async () => {
          await sandboxHandler.whenPeerDiscovered();
          sandboxHandler.send({
            type: 'COMPLETE_CHECKOUT',
            payload: { result: currentSessionId ?? 'complete' },
          });
        },
      });

      document.getElementById('checkout')?.replaceChildren();
      checkout.mount('#checkout');
      unsubscribeInitialize();
    } catch (err) {
      try {
        await sandboxHandler.whenPeerDiscovered();
        sandboxHandler.send({
          type: 'ERROR',
          payload: { message: err instanceof Error ? err.message : String(err) },
        });
      } catch { /* ignore */ }
      // eslint-disable-next-line no-console
      console.error('[Stripe iframe] initialize error', err);
    }
  });

  sandboxHandler.subscribe('START_CHECKOUT', (payload) => {
    currentSessionId = payload.sessionId ?? null;
    resolve(payload.key);
  });
};
