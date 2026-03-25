import './stripe.html'
import { PostMessageHelper } from '../Empower2026/postMessageHelper';

interface EmbeddedCheckout {
  mount: (selector: string) => void;
}

interface StripeInstance {
  initEmbeddedCheckout: (options: {
    fetchClientSecret: () => Promise<string>;
  }) => Promise<EmbeddedCheckout>;
}
// Library loaded externally in the standalone HTML page /public/stripe.html
declare const Stripe: (publishableKey: string) => StripeInstance;

// Initialize Stripe.js
const stripe = Stripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY,
);

const sandboxOrigin = 'https://sandbox-forms.a.clouddev.laserfiche.com';
const stripeChannelId = 'empower2026-checkout';

/**
 * Messages that can be sent between the Stripe embedded checkout iframe
 * and the LFForm sandbox
 */
export type StripeMessages = {
  INITIALIZE: { action: 'initialize' };
  START_CHECKOUT: { key: string };
  COMPLETE_CHECKOUT: { result: string };
};

const sandboxHandler = new PostMessageHelper<StripeMessages>(
  sandboxOrigin,
  {
    channelId: stripeChannelId,
    // Ignore unrelated messages
    onInvalidMessage: () => { },
    peerDiscovery: true,
  }
);

const sandboxPeerReady = sandboxHandler.whenPeerDiscovered();

// Stripe checkout redirects back with a query parameter "checkout" containing the result
// We want to check this first
const handleCheckoutComplete = async () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const checkoutResult = urlSearchParams.get('checkout');
  if (checkoutResult) {
    await sandboxPeerReady;

    sandboxHandler.send({
      type: 'COMPLETE_CHECKOUT',
      payload: { result: checkoutResult },
    });
  }
};
void handleCheckoutComplete();

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
const unsubscribeInitialize = sandboxHandler.subscribe(
  'INITIALIZE',
  async () => {
    const checkout = await stripe.initEmbeddedCheckout({
      fetchClientSecret: () => clientSecret,
    });
    const mountTo = document.getElementById('checkout');
    mountTo?.replaceChildren();
    // Mount Checkout
    checkout.mount('#checkout');
    unsubscribeInitialize();
  },
);

/**
 * Handle the 'START_CHECKOUT' message from the LFForm sandbox
 * This message is sent when the checkout session lookup rule completes and returns a session key
 */
const unsubscribeInitCheckout = sandboxHandler.subscribe(
  'START_CHECKOUT',
  async (payload) => {
    resolve(payload.key);

    unsubscribeInitCheckout();
  },
);
