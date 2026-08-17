import { PostMessageHelper } from '../../lib/utils/postMessageHelper';
import { loadGatewayScript } from '../../lib/utils/loadGatewayScript';
import type { StripeMessages } from '../Stripe/index';

interface BraintreeDropin {
  requestPaymentMethod(): Promise<{ nonce: string; type: string }>;
  teardown(): Promise<void>;
  isPaymentMethodRequestable(): boolean;
}

declare const braintree: {
  dropin: {
    create(options: {
      authorization: string;
      container: string | HTMLElement;
      paymentOptionPriority?: string[];
    }): Promise<BraintreeDropin>;
  };
};

/**
 * The only URL this plugin will load the Braintree Drop-in SDK from.
 *
 * Deliberately a module constant, not a parameter: `params` comes from the URL
 * hash fragment, which an attacker controls in a crafted link. A caller-supplied
 * script URL would execute arbitrary JavaScript in the same document tree as the
 * gateway's card-capture iframe.
 */
export const BRAINTREE_DROPIN_SDK_URL =
  'https://js.braintreegateway.com/web/dropin/1.43.0/js/dropin.min.js';

/**
 * Initialise the Braintree Drop-in handler inside a sandbox iframe.
 *
 * Call this when `window.__lfSandboxMode === 'braintree-sandbox'`.
 * `params` should be `window.__lfSandboxParams` (set by sandbox.html) and must
 * contain `channelId`. The Drop-in SDK is loaded from
 * {@link BRAINTREE_DROPIN_SDK_URL}; the URL is not configurable.
 *
 * Flow:
 *   1. Parent sends INITIALIZE with `clientToken` (or `pk` field is unused)
 *   2. This handler loads the Braintree SDK and creates the Drop-in UI
 *   3. User fills in payment details and clicks the "Pay Now" button
 *   4. Drop-in calls `requestPaymentMethod()` → returns a nonce
 *   5. Sends COMPLETE_CHECKOUT with the nonce back to the parent form
 */
export const initBraintreeIframe = (params: URLSearchParams): void => {
  const channelId = params.get('channelId') ?? 'empower2026-checkout';
  // tk = static tokenization key (fallback when no per-session clientToken is provided)
  const staticTokenizationKey = params.get('tk') ?? '';

  console.log('[Braintree] iframe mode — channelId:', channelId);

  const sandboxHandler = new PostMessageHelper<StripeMessages>(window.location.origin, {
    channelId,
    onInvalidMessage: () => {},
    peerDiscovery: true,
    // Default getSiblingFrames() finds the outer LF sandbox — the correct peer.
  });

  sandboxHandler.whenPeerDiscovered().then(
    () => console.log('[Braintree] peer discovered'),
    () => {},
  );

  const unsubscribeInitialize = sandboxHandler.subscribe('INITIALIZE', async (payload) => {
    // clientToken from INITIALIZE takes precedence over the static tokenization key
    const authorization = payload?.clientToken ?? staticTokenizationKey;
    const amount = payload?.amount ?? '';
    if (!authorization) {
      await sandboxHandler.whenPeerDiscovered();
      sandboxHandler.send({
        type: 'ERROR',
        payload: { message: '[Braintree] No authorization provided. Set VITE_BRAINTREE_TOKENIZATION_KEY or configure a lookup rule to write a client_token to the sessionId field.' },
      });
      return;
    }

    try {
      await loadGatewayScript(BRAINTREE_DROPIN_SDK_URL);

      const container = document.getElementById('checkout');
      if (!container) throw new Error('[Braintree] Mount point #checkout not found');

      // Show the amount above the Drop-in so the user knows what they are paying
      if (amount) {
        const header = document.createElement('div');
        header.style.cssText = 'text-align:center;padding:12px 0 16px;font-size:1.125rem;font-weight:600;border-bottom:1px solid #e5e7eb;margin-bottom:16px;';
        header.textContent = `Total: ${amount}`;
        container.insertAdjacentElement('beforebegin', header);
      }

      const dropinInstance = await braintree.dropin.create({
        authorization,
        container: '#checkout',
      });

      // Render the Pay Now button below the Drop-in form
      const payBtnLabel = amount ? `Pay ${amount}` : 'Pay Now';
      const payBtn = document.createElement('button');
      payBtn.type = 'button';
      payBtn.textContent = payBtnLabel;
      payBtn.className = 'lf-primary-button';
      payBtn.style.cssText = 'margin-top:1rem;width:100%;';
      container.insertAdjacentElement('afterend', payBtn);

      payBtn.addEventListener('click', async () => {
        payBtn.disabled = true;
        payBtn.textContent = 'Processing…';
        try {
          const { nonce } = await dropinInstance.requestPaymentMethod();
          await sandboxHandler.whenPeerDiscovered();
          sandboxHandler.send({ type: 'COMPLETE_CHECKOUT', payload: { result: nonce } });
        } catch {
          // requestPaymentMethod() throws for recoverable validation errors
          // (empty fields, invalid card number). The Drop-in already shows inline
          // validation messages — reset the button so the user can fix and retry.
          // Do NOT send ERROR: that would kill the parent's subscriptions and
          // prevent a subsequent successful COMPLETE_CHECKOUT from being received.
          payBtn.disabled = false;
          payBtn.textContent = payBtnLabel;
        }
      });

      unsubscribeInitialize();
    } catch (err) {
      try {
        await sandboxHandler.whenPeerDiscovered();
        sandboxHandler.send({
          type: 'ERROR',
          payload: { message: err instanceof Error ? err.message : String(err) },
        });
      } catch { /* ignore */ }
      console.error('[Braintree iframe] initialize error', err);
    }
  });
};
