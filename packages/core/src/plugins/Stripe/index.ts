import { PostMessageHelper } from '../../lib/utils/postMessageHelper';

interface EmbeddedCheckout {
  mount: (selector: string) => void;
}

interface StripeInstance {
  initEmbeddedCheckout: (options: {
    fetchClientSecret: () => Promise<string>;
    onComplete?: () => void | Promise<void>;
  }) => Promise<EmbeddedCheckout>;
}
// Library loaded externally in the standalone HTML page /plugins/Stripe/stripe.html
declare const Stripe: (publishableKey: string) => StripeInstance;

// Determine publishable key from iframe query param `pk` or build-time env.
const searchParams = new URLSearchParams(window.location.search);
const envPublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
// Note: we do not initialize Stripe at module load so consumers can supply `pk` at runtime via the iframe URL.

const sandboxOrigin = (() => {
  const parentOriginParam = searchParams.get('parentOrigin');
  if (parentOriginParam) {
    try {
      return new URL(parentOriginParam).origin;
    } catch {
      // ignore and continue to other strategies
    }
  }

  try {
    if (document.referrer) {
      return new URL(document.referrer).origin;
    }
  } catch {
    // fallback below
  }
  return '*';
})();
const stripeChannelId = searchParams.get('channelId') ?? 'empower2026-checkout';
let currentSessionId: string | null = null;

/**
 * Messages that can be sent between the Stripe embedded checkout iframe
 * and the LFForm sandbox
 */
export type StripeMessages = {
  INITIALIZE: { action: 'initialize'; pk?: string };
  START_CHECKOUT: { key: string; sessionId?: string };
  COMPLETE_CHECKOUT: { result: string };
  ERROR: { message: string };
};

const sandboxHandler = new PostMessageHelper<StripeMessages>(
  sandboxOrigin,
  {
    channelId: stripeChannelId,
    // Host shells can emit unrelated messages; keep these silent.
    onInvalidMessage: () => {},
    peerDiscovery: true,
  }
);

const sandboxPeerReady = sandboxHandler.whenPeerDiscovered();

/**
 * Shared promise for fetching the client secret
 * Allows us to initialize the client while the client secret
 * is loading from the form lookup rule
 */
const { resolve, promise: clientSecret } = Promise.withResolvers<string>();

/**
 * Initialize the Stripe embedded checkout when the 'INITIALIZE' message is received
 * 'INITIALIZE' message is sent when the user clicks the checkout button
 */
const unsubscribeInitialize = sandboxHandler.subscribe('INITIALIZE', async (payload) => {
  try {
    // Allow the iframe caller to provide the publishable key via ?pk=...; fall back to build env key.
    const runtimePk = payload?.pk ?? searchParams.get('pk');
    const stripePublishableKey = runtimePk ?? envPublishableKey;
    if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
      await sandboxPeerReady;
      sandboxHandler.send({
        type: 'ERROR',
        payload: { message: '[Stripe] Invalid publishable key. Provide `pk` query param or set VITE_STRIPE_PUBLIC_KEY at build time.' },
      });
      return;
    }

    const stripe = Stripe(stripePublishableKey);

    const checkout = await stripe.initEmbeddedCheckout({
      fetchClientSecret: () => clientSecret,
      onComplete: async () => {
        await sandboxPeerReady;
        sandboxHandler.send({ type: 'COMPLETE_CHECKOUT', payload: { result: currentSessionId ?? 'complete' } });
      },
    });

    const mountTo = document.getElementById('checkout');
    mountTo?.replaceChildren();
    // Mount Checkout
    checkout.mount('#checkout');
    unsubscribeInitialize();
  } catch (err) {
    // Don't let errors bubble as uncaught exceptions; notify parent and log.
    try {
      await sandboxPeerReady;
      sandboxHandler.send({
        type: 'ERROR',
        payload: { message: (err instanceof Error) ? err.message : String(err) },
      });
    } catch {
      // ignore
    }
    // Keep console for debugging
    // eslint-disable-next-line no-console
    console.error('[Stripe iframe] initialize error', err);
  }
});

/**
 * Handle the 'START_CHECKOUT' message from the LFForm sandbox
 * This message is sent when the checkout session lookup rule completes and returns a session key
 */
const unsubscribeInitCheckout = sandboxHandler.subscribe(
  'START_CHECKOUT',
  async (payload) => {
    currentSessionId = payload.sessionId ?? null;
    resolve(payload.key);

    unsubscribeInitCheckout();
  },
);

export default {};
