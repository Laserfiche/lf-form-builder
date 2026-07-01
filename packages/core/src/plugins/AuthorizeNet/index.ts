import { PostMessageHelper } from '../../lib/utils/postMessageHelper';
import type { StripeMessages } from '../Stripe/index';

/**
 * Calls Authorize.net's securePaymentContainerRequest tokenization endpoint
 * directly via fetch() — the same HTTP call Accept.js makes under the hood.
 * Using fetch() instead of Accept.js avoids CSP script-src restrictions and
 * the unreliable CDN URL (which sometimes returns HTML instead of JS).
 *
 * The Client Key is a public browser-side key; card data never touches our server.
 */
const tokenizeCard = async (opts: {
  apiLoginID: string;
  clientKey: string;
  cardNumber: string;
  month: string;
  year: string;
  cardCode: string;
  sandbox: boolean;
}): Promise<{ dataDescriptor: string; dataValue: string }> => {
  const endpoint = opts.sandbox
    ? 'https://apitest.authorize.net/xml/v1/request.api'
    : 'https://api.authorize.net/xml/v1/request.api';

  const expirationDate = `${opts.year}-${opts.month.padStart(2, '0')}`;

  const body = {
    securePaymentContainerRequest: {
      merchantAuthentication: { name: opts.apiLoginID, clientKey: opts.clientKey },
      data: {
        type: 'TOKEN',
        id: `req-${Math.random().toString(36).slice(2)}`,
        token: { cardNumber: opts.cardNumber, expirationDate, cardCode: opts.cardCode },
      },
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const data = await res.json() as {
    messages?: { resultCode: string; message?: Array<{ description: string }> };
    opaqueData?: { dataDescriptor: string; dataValue: string };
  };

  if (data.messages?.resultCode !== 'Ok') {
    const msgs = (data.messages?.message ?? []).map((m) => m.description).join(' ');
    throw new Error(msgs || `Tokenization failed (resultCode: ${data.messages?.resultCode ?? 'unknown'})`);
  }
  if (!data.opaqueData?.dataDescriptor || !data.opaqueData?.dataValue) {
    throw new Error('Authorize.net did not return opaque payment data.');
  }
  return { dataDescriptor: data.opaqueData.dataDescriptor, dataValue: data.opaqueData.dataValue };
};

/**
 * Initialise the Authorize.net card form inside a sandbox iframe.
 *
 * Call this when `window.__lfSandboxMode === 'authorizenet-sandbox'`.
 * `params` should be `window.__lfSandboxParams` (set by sandbox.html) and must
 * contain `channelId`. The `sandbox` param (default: `'true'`) selects the
 * apitest vs api endpoint.
 *
 * Flow:
 *   1. Parent sends INITIALIZE with `apiLoginId`, `clientKey`, and optional `amount`
 *   2. This handler renders a custom card form
 *   3. User fills in card details and clicks Pay
 *   4. tokenizeCard() POSTs to Authorize.net → returns opaqueData { dataDescriptor, dataValue }
 *   5. Sends COMPLETE_CHECKOUT with JSON.stringify({ dataDescriptor, dataValue }) back to the parent
 */
export const initAuthorizeNetIframe = (params: URLSearchParams): void => {
  const channelId = params.get('channelId') ?? 'empower2026-authorizenet-checkout';
  const staticApiLoginId = params.get('apiLoginId') ?? params.get('aid') ?? '';
  const staticClientKey = params.get('ck') ?? '';
  // Default to sandbox=true so test credentials route to apitest.authorize.net
  const isSandbox = params.get('sandbox') !== 'false';

  console.log('[AuthorizeNet] iframe mode — channelId:', channelId, '| sandbox:', isSandbox);

  const sandboxHandler = new PostMessageHelper<StripeMessages>(window.location.origin, {
    channelId,
    onInvalidMessage: () => {},
    peerDiscovery: true,
    // Default getSiblingFrames() finds the outer LF sandbox — the correct peer.
  });

  sandboxHandler.whenPeerDiscovered().then(
    () => console.log('[AuthorizeNet] peer discovered'),
    () => {},
  );

  const unsubscribeInitialize = sandboxHandler.subscribe('INITIALIZE', async (payload) => {
    const apiLoginID = payload?.apiLoginId ?? staticApiLoginId;
    const clientKey = payload?.clientKey ?? staticClientKey;
    const amount = payload?.amount ?? '';

    if (!apiLoginID || !clientKey) {
      await sandboxHandler.whenPeerDiscovered();
      sandboxHandler.send({
        type: 'ERROR',
        payload: {
          message:
            '[AuthorizeNet] Missing apiLoginId or clientKey. Set VITE_AUTHORIZENET_API_LOGIN_ID and ' +
            'VITE_AUTHORIZENET_CLIENT_KEY in .env.local.',
        },
      });
      return;
    }

    try {
      const container = document.getElementById('checkout');
      if (!container) throw new Error('[AuthorizeNet] Mount point #checkout not found');

      if (amount) {
        const header = document.createElement('div');
        header.style.cssText =
          'text-align:center;padding:12px 0 16px;font-size:1.125rem;font-weight:600;' +
          'border-bottom:1px solid #e5e7eb;margin-bottom:16px;';
        header.textContent = `Total: ${amount}`;
        container.insertAdjacentElement('beforebegin', header);
      }

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem;padding:0.5rem 0">
          <div>
            <label style="display:block;margin-bottom:4px;font-size:0.875rem;font-weight:500;">Card Number</label>
            <input id="an-card-number" type="text" inputmode="numeric" autocomplete="cc-number"
              placeholder="1234 5678 9012 3456"
              style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:1rem;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem">
            <div>
              <label style="display:block;margin-bottom:4px;font-size:0.875rem;font-weight:500;">Month</label>
              <input id="an-exp-month" type="text" inputmode="numeric" placeholder="MM" maxlength="2"
                style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:1rem;" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:0.875rem;font-weight:500;">Year</label>
              <input id="an-exp-year" type="text" inputmode="numeric" placeholder="YYYY" maxlength="4"
                style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:1rem;" />
            </div>
            <div>
              <label style="display:block;margin-bottom:4px;font-size:0.875rem;font-weight:500;">CVV</label>
              <input id="an-cvv" type="text" inputmode="numeric" placeholder="123" maxlength="4"
                style="width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:1rem;" />
            </div>
          </div>
          <div id="an-error" style="display:none;color:#b91c1c;font-size:0.875rem;padding:8px 12px;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;"></div>
        </div>
      `;

      const payBtnLabel = amount ? `Pay ${amount}` : 'Pay Now';
      const payBtn = document.createElement('button');
      payBtn.type = 'button';
      payBtn.textContent = payBtnLabel;
      payBtn.className = 'lf-primary-button';
      payBtn.style.cssText = 'margin-top:1rem;width:100%;';
      container.insertAdjacentElement('afterend', payBtn);

      const errorDiv = document.getElementById('an-error') as HTMLElement;

      payBtn.addEventListener('click', () => {
        payBtn.disabled = true;
        payBtn.textContent = 'Processing…';
        errorDiv.style.display = 'none';

        const cardNumber =
          ((document.getElementById('an-card-number') as HTMLInputElement | null)?.value ?? '').replace(/\s/g, '');
        const month =
          (document.getElementById('an-exp-month') as HTMLInputElement | null)?.value.trim() ?? '';
        const year =
          (document.getElementById('an-exp-year') as HTMLInputElement | null)?.value.trim() ?? '';
        const cardCode =
          (document.getElementById('an-cvv') as HTMLInputElement | null)?.value.trim() ?? '';

        const showError = (msg: string) => {
          errorDiv.textContent = msg;
          errorDiv.style.display = 'block';
          payBtn.disabled = false;
          payBtn.textContent = payBtnLabel;
        };

        if (!cardNumber || !month || !year || !cardCode) {
          showError('Please fill in all card fields.');
          return;
        }

        void tokenizeCard({ apiLoginID, clientKey, cardNumber, month, year, cardCode, sandbox: isSandbox })
          .then(({ dataDescriptor, dataValue }) => {
            console.log('[AuthorizeNet] tokenization succeeded — sending COMPLETE_CHECKOUT');
            // Send tokenized payment data to the parent form to trigger the charge lookup rule.
            // Do NOT send ERROR on card validation failures — that kills parent subscriptions.
            sandboxHandler.send({
              type: 'COMPLETE_CHECKOUT',
              payload: { result: JSON.stringify({ dataDescriptor, dataValue }) },
            });
          })
          .catch((err: unknown) => {
            console.error('[AuthorizeNet] tokenization error:', err);
            showError(err instanceof Error ? err.message : 'Payment tokenization failed — check browser console.');
          });
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
      console.error('[AuthorizeNet iframe] initialize error', err);
    }
  });
};
