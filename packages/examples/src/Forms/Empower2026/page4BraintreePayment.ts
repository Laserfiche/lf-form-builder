import {
  PostMessageHelper,
  LFFormModal,
  hideFieldSafe,
  setFieldValueSafe,
  showFieldSafe,
  waitWithTimeout,
  setCustomHtml,
  type StripeMessages,
} from '@lf/lf-form-builder';
import {
  LFFormId,
  TextField,
  type LFFormEventSubscribeOptions,
} from '@lf/lf-form-types';

// ─── Configuration ────────────────────────────────────────────────────────────

/** Braintree Drop-in UI SDK. */
export const BRAINTREE_DROPIN_URL = 'https://js.braintreegateway.com/web/dropin/1.43.0/js/dropin.min.js';

const DISABLE_PAGE4 = import.meta.env.VITE_DISABLE_PAGE4 === 'true';

// Set VITE_BRAINTREE_TOKENIZATION_KEY=sandbox_... or production_... in .env.local.
//
// This is the static Braintree tokenization key used as a fallback authorization
// credential when the sessionId lookup rule has not yet written a client_token.
// Prefer server-generated client_tokens for production (more secure, support vaulting).
const braintreeTokenizationKey = import.meta.env.VITE_BRAINTREE_TOKENIZATION_KEY?.trim();
const hasValidBraintreeKey =
  !!braintreeTokenizationKey &&
  (braintreeTokenizationKey.startsWith('sandbox_') || braintreeTokenizationKey.startsWith('production_'));

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BraintreeWindow extends Window {
  triggerBraintreeCheckout: () => Promise<void>;
}
declare const window: BraintreeWindow;

/**
 * Maps each payment-related form field to its LFFormId.
 *
 * Required fields:
 *   checkoutFrame         — CustomHTML field that hosts the Braintree Drop-in iframe
 *   isFinished            — Text field; set to 'success' or 'fail' on completion
 *   checkoutSessionResult — CustomHTML field that shows success/error messages
 *   triggerCheckoutButton — CustomHTML field that renders the Checkout button
 *   sessionId             — Text field that receives the Braintree client_token from a
 *                           lookup rule. If empty, falls back to the tokenization key.
 *   paymentNonce          — Text field where the result nonce is written after success.
 *                           Send this nonce to your server to complete the transaction.
 *
 * Optional fields:
 *   checkoutModal    — Modal field; if present the iframe opens inside a modal
 *   ProductSelection — When changed, resets checkout so a new session is required
 *   Cost             — Numeric field; Checkout button is disabled when Cost ≤ 0
 *   transactionId           — Text field; charge lookup rule writes the transaction ID here
 *   finalstatus             — Text field; verification lookup rule writes the final status here
 *   finalamount             — Text field; verification lookup rule writes the final amount here
 *   finalcurrencyIsoCode    — Text field; verification lookup rule writes the currency ISO code here
 *   finalmerchantAccountId  — Text field; verification lookup rule writes the merchant account ID here
 */
export type BraintreePaymentFormFields = {
  checkoutFrame: LFFormId;
  isFinished: LFFormId;
  checkoutSessionResult: LFFormId;
  triggerCheckoutButton: LFFormId;
  sessionId: LFFormId;
  paymentNonce: LFFormId;
  checkoutModal?: LFFormId;
  ProductSelection?: LFFormId;
  Cost?: LFFormId;
  transactionId?: LFFormId;


  finalstatus?: LFFormId;
  finalcurrencyIsoCode?: LFFormId;
  finalmerchantAccountId?: LFFormId;
  finalamount?: LFFormId;
};

// ─── Form field IDs ───────────────────────────────────────────────────────────
// Update these fieldId values to match your Braintree form design.

export const page4BraintreeFormFields: BraintreePaymentFormFields = {
  checkoutFrame:          { fieldId: 42 } as const, // CustomHTML  — hosts the Braintree Drop-in iframe
  isFinished:             { fieldId: 43 } as const, // Single-line text — set to 'success' or 'fail'
  checkoutSessionResult:  { fieldId: 44 } as const, // CustomHTML  — displays success/error messages
  triggerCheckoutButton:  { fieldId: 45 } as const, // CustomHTML  — renders the Checkout button
  sessionId:              { fieldId: 46 } as const, // Single-line text — lookup rule writes client_token here
  paymentNonce:           { fieldId: 47 } as const, // Single-line text — nonce written here after tokenization; send to your server to charge the card
  checkoutModal:          { fieldId: 49 } as const, // Modal        — optional; Drop-in opens inside the modal
  ProductSelection:       { fieldId: 50 } as const, // Radio/Dropdown — changing this resets checkout
  Cost:                   { fieldId: 58 } as const, // Single-line text  — Checkout button disabled when ≤ 0
  transactionId:          { fieldId: 59 } as const, // Single-line text — optional; lookup rule writes transaction ID here
 
  finalstatus:            { fieldId: 54 } as const, // single-line text — optional; lookup rule writes final status here
  finalamount:            { fieldId: 55 } as const, // single-line text — optional; lookup rule writes final amount here
  finalcurrencyIsoCode:   { fieldId: 56 } as const, // single-line text — optional; lookup rule writes final currency ISO code here
  finalmerchantAccountId: { fieldId: 57 } as const, // single-line text — optional; lookup rule writes final merchant account ID here
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Extracts a Braintree client_token from the sessionId field value.
 * A Braintree client_token is a base64-encoded JWT (starts with "eyJ") or a
 * legacy format. Accepts any non-trivially-short string.
 */
function extractClientToken(value: unknown): string | null {
  const raw = Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
  const s = raw.trim();
  return s.length > 10 ? s : null;
}

/** Parses a field value (string, number, or single-element array) into a number. */
function parseCostValue(raw: unknown): number {
  const parseOne = (v: unknown): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^0-9.-]+/g, '').trim();
      return cleaned === '' ? NaN : parseFloat(cleaned);
    }
    return NaN;
  };
  return Array.isArray(raw) ? parseOne(raw[0]) : parseOne(raw);
}

/** Returns false only while a charge is in-flight (isFinished === 'charge'). */
function isCheckoutAllowed(formFields: BraintreePaymentFormFields): boolean {
  const raw = LFForm.getFieldValues<TextField>(formFields.isFinished);
  const val = (Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')).trim();
  return val !== 'charge';
}

const withHandlerName = (
  field: LFFormId,
  handlerName: string,
): LFFormEventSubscribeOptions<'fieldChange'> => ({ ...field, handlerName });

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const getErrorMessage = (payload: unknown): string =>
  typeof payload === 'object' && payload !== null &&
  typeof (payload as Record<string, unknown>).message === 'string'
    ? (payload as Record<string, string>).message
    : JSON.stringify(payload ?? {});

// ─── page4BraintreeLoad ───────────────────────────────────────────────────────

/**
 * Initialises the Braintree Drop-in payment flow.
 *
 * How it works:
 *   1. (Optional) A lookup rule creates a Braintree client_token server-side and
 *      writes it to the sessionId field. If no lookup rule is configured, the
 *      static VITE_BRAINTREE_TOKENIZATION_KEY is used instead.
 *   2. The user clicks Checkout → the Braintree Drop-in UI renders in an iframe.
 *      The Drop-in includes its own "Pay Now" button.
 *   3. After the user fills in card details and clicks Pay Now, a payment nonce is
 *      returned and written to the paymentNonce field.
 *   4. Send the nonce to your server (via a lookup rule or submit action) to call
 *      `transaction.sale({ paymentMethodNonce: nonce, amount: ... })` in the Braintree SDK.
 *   5. isFinished is set to 'success' or 'fail'.
 *
 * To configure for a new form:
 *   1. Update page4BraintreeFormFields with the correct field IDs.
 *   2. Set VITE_BRAINTREE_TOKENIZATION_KEY in .env.local.
 *   3. (Recommended) Add a lookup rule that generates a server-side client_token and
 *      writes it to the sessionId field — this enables vaulting and advanced features.
 *   4. Call page4BraintreeLoad({ formFields: page4BraintreeFormFields }) from your index.
 */
export const page4BraintreeLoad = DISABLE_PAGE4
  ? async () => { console.log('[Empower2026] page4BraintreeLoad disabled via VITE_DISABLE_PAGE4'); }
  : async ({
      formFields,
      messagerChannelId,
    }: {
      formFields: BraintreePaymentFormFields;
      messagerChannelId?: string;
    }) => {

  if (typeof LFForm === 'undefined') {
    console.warn('[Empower2026] LFForm not present — skipping page4BraintreeLoad');
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  // Random per page load — makes it harder for a rogue sibling frame to win
  // the __lfEmbedScriptResponse race by guessing a static channel ID.
  const paymentChannelId = messagerChannelId ?? `bt-${Math.random().toString(36).slice(2, 10)}`;
  let paymentMessager: PostMessageHelper<StripeMessages> | null = null;
  let checkoutModalInstance: LFFormModal | null = null;
  // Latches to true the first time a valid credential is seen (tokenization key
  // set at build time, or clientToken written by the lookup rule). Once latched,
  // the button state only depends on Cost — matching how page3 uses the static
  // Stripe publishable key.
  let credentialDetected = hasValidBraintreeKey;

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const closeCheckoutUi = async () => {
    // Hide the modal overlay if one is open — hideFieldSafe alone doesn't dismiss it.
    try { await checkoutModalInstance?.hide?.(); } catch { /* ignore */ }
    await Promise.all([
      LFForm.changeFieldSettings(formFields.checkoutFrame, { description: '', content: '' }),
      LFForm.setFieldValues<TextField>(formFields.checkoutFrame, ''),
      LFForm.changeFieldSettings(formFields.checkoutSessionResult, { description: '', content: '' }),
      LFForm.setFieldValues<TextField>(formFields.checkoutSessionResult, ''),
    ]);
    await Promise.all([
      hideFieldSafe(formFields.checkoutFrame),
      hideFieldSafe(formFields.checkoutModal),
      hideFieldSafe(formFields.checkoutSessionResult),
    ]);
  };

  const setCheckoutResultHtml = async (html: string) => {
    await setCustomHtml(formFields.checkoutSessionResult, html);
    await showFieldSafe(formFields.checkoutSessionResult);
  };

  const renderCheckoutButton = (enabled = true, helperText = '') => {
    const html = /*html*/`
      <button type="button" onclick="triggerBraintreeCheckout()" class="lf-secondary-button" ${enabled ? '' : 'disabled'}>
        Checkout
      </button>
      ${helperText ? `<div style="margin-top:0.5rem;color:#b42318;font-size:0.875rem;">${helperText}</div>` : ''}
    `;
    return setCustomHtml(formFields.triggerCheckoutButton, html);
  };

  /**
   * Enables the Checkout button when a credential is available and Cost > 0.
   * Checks sessionId once to latch credentialDetected — after that only Cost
   * matters, matching how page3 uses the static Stripe publishable key.
   */
  const syncCheckoutButtonState = async () => {
    if (!credentialDetected) {
      credentialDetected = !!extractClientToken(LFForm.getFieldValues<TextField>(formFields.sessionId));
    }
    if (!credentialDetected) {
      await renderCheckoutButton(false);
      return;
    }
    if (formFields.Cost) {
      const num = parseCostValue(LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown);
      const enabled = !Number.isNaN(num) && num > 0 && isCheckoutAllowed(formFields);
      await renderCheckoutButton(enabled);
      if (!enabled) await closeCheckoutUi();
      return;
    }
    await renderCheckoutButton(false);
    await closeCheckoutUi();
  };

  // ── Braintree iframe ───────────────────────────────────────────────────────

  const createMessager = () => {
    paymentMessager?.destroy?.();
    paymentMessager = new PostMessageHelper<StripeMessages>(window.location.origin, {
      channelId: paymentChannelId,
      onInvalidMessage: () => {},
      peerDiscovery: true,
    });
    return paymentMessager;
  };

  /**
   * Injects the Braintree Drop-in iframe (sandbox.html in braintree-sandbox mode).
   *
   * Params travel as flat hash fragment params — the LF form sanitizer strips
   * query strings from iframe src attributes but leaves the hash intact.
   *
   *   tk  = static tokenization key (VITE_BRAINTREE_TOKENIZATION_KEY), used as
   *         fallback authorization if no client_token is passed in INITIALIZE
   *   scriptSrc = Braintree Drop-in CDN URL, loaded lazily by the iframe
   */
  const injectBraintreeFrame = () => {
    const frameParams = new URLSearchParams({
      rootId: 'checkout',
      mode: 'braintree-sandbox',
      channelId: paymentChannelId,
      tk: braintreeTokenizationKey ?? '',
      scriptSrc: BRAINTREE_DROPIN_URL,
    });
    const sandboxHtmlUrl = `${window.location.origin}${window.location.pathname}`;
    const framedSrc = `${sandboxHtmlUrl}#${frameParams}`;
    console.log('[page4BraintreePayment] injectBraintreeFrame —', sandboxHtmlUrl);

    const iframeHtml = `<iframe id="braintree-checkout-iframe" class="stripe-checkout-iframe"
      src="${framedSrc}" width="100%" height="550" frameborder="0" scrolling="no"
      allow="payment *" style="display:block;border:0;outline:0;box-shadow:none;background:transparent;">
    </iframe>`;

    if (formFields.checkoutModal) {
      if (!checkoutModalInstance) {
        checkoutModalInstance = new LFFormModal(formFields.checkoutModal);
        checkoutModalInstance.setDetails({ title: 'Checkout' });
        checkoutModalInstance.onClose('close', () => { void closeCheckoutUi(); });
      }
      void showFieldSafe(formFields.checkoutModal);
      checkoutModalInstance.setDetails({ content: iframeHtml });
      return checkoutModalInstance.show();
    }

    return setCustomHtml(formFields.checkoutFrame, `<div class="stripe-checkout-frame">${iframeHtml}</div>`);
  };

  // ── Checkout flow ──────────────────────────────────────────────────────────

  /**
   * Main checkout entry point — called by the Checkout button via
   * window.triggerBraintreeCheckout().
   *
   * Sequence:
   *   1. Inject the Drop-in iframe
   *   2. Wait for the iframe's PostMessageHelper to respond (peer discovery)
   *   3. Send INITIALIZE with the client_token (from sessionId field) or the
   *      static tokenization key — this creates the Braintree Drop-in UI
   *   4. The iframe renders card fields + a Pay Now button
   *   5. User fills in card details and clicks Pay Now
   *   6. The iframe calls requestPaymentMethod() → sends COMPLETE_CHECKOUT with nonce
   *   7. This handler writes the nonce to paymentNonce and sets isFinished = 'success'
   *   8. Your server should then process the nonce via transaction.sale()
   */
  const triggerBraintreeCheckout = async () => {
    console.log('[page4BraintreePayment] triggerBraintreeCheckout called');

    const raw = LFForm.getFieldValues<TextField>(formFields.sessionId);
    const clientToken = extractClientToken(raw) ?? braintreeTokenizationKey ?? '';
    if (!clientToken) {
      await setCheckoutResultHtml('<div style="color:red"><strong>Braintree configuration error:</strong> No authorization credential — set VITE_BRAINTREE_TOKENIZATION_KEY in .env.local or ensure the lookup rule writes a client_token to the sessionId field.</div>');
      await setFieldValueSafe(formFields.isFinished, 'fail');
      return;
    }

    let unsubscribeComplete: (() => void) | undefined;
    let unsubscribeError:    (() => void) | undefined;

    const cleanupSubscriptions = () => {
      try { unsubscribeComplete?.(); } catch { /* ignore */ }
      try { unsubscribeError?.();    } catch { /* ignore */ }
      unsubscribeComplete = unsubscribeError = undefined;
    };

    try {
      await closeCheckoutUi();
      const messager = createMessager();
      let handled = false;

      unsubscribeComplete = messager.subscribe('COMPLETE_CHECKOUT', async (payload) => {
        if (handled) return;
        handled = true;
        cleanupSubscriptions();
        console.log('[page4BraintreePayment] COMPLETE_CHECKOUT — nonce received, auto-charging');
        try {
          const nonce = typeof payload === 'object' && payload !== null
            ? String((payload as Record<string, unknown>).result ?? '')
            : '';
          await setFieldValueSafe(formFields.paymentNonce, nonce);
          // Close the iframe/modal immediately
          await closeCheckoutUi();
          // Show processing state while the charge lookup runs
          await setCheckoutResultHtml('<div style="color:#555">Processing payment…</div>');
          // Trigger the charge lookup rule — it reads paymentNonce + Cost and
          // calls chargePaymentMethod on the server, then writes transactionId.
          await setFieldValueSafe(formFields.isFinished, 'charge');
          await renderCheckoutButton(false);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await setCheckoutResultHtml(`<div style="color:red"><strong>Braintree error:</strong> Error handling completion: ${msg}</div>`);
          await setFieldValueSafe(formFields.isFinished, 'fail');
        }
      });

      unsubscribeError = messager.subscribe('ERROR', async (payload) => {
        if (handled) return;
        handled = true;
        cleanupSubscriptions();
        try {
          await setCheckoutResultHtml(`<div style="color:red"><strong>Braintree error:</strong> ${escapeHtml(getErrorMessage(payload))}</div>`);
          await setFieldValueSafe(formFields.isFinished, 'fail');
          if (!checkoutModalInstance) await setCustomHtml(formFields.checkoutFrame, '');
        } catch { /* ignore */ }
      });

      await injectBraintreeFrame();
      const peerReady = messager.whenPeerDiscovered();

      try {
        await waitWithTimeout(peerReady, 15000);
      } catch {
        console.warn('[page4BraintreePayment] peer discovery timed out');
        cleanupSubscriptions();
        return;
      }

      // Format the cost as a display amount (e.g. "$1,995.00") for the iframe header.
      const costRaw = formFields.Cost
        ? LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown
        : null;
      const costNum = costRaw !== null ? parseCostValue(costRaw) : NaN;
      const amount = !Number.isNaN(costNum) && costNum > 0
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(costNum)
        : '';

      // Send INITIALIZE — the iframe renders a total header, Drop-in card fields,
      // and a "Pay $X.XX" button. No further messages needed from this side.
      messager.send({ type: 'INITIALIZE', payload: { action: 'initialize', clientToken, amount } });

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[page4BraintreePayment] triggerBraintreeCheckout error:', message);
      await setCheckoutResultHtml(`<div style="color:red"><strong>Braintree error:</strong> ${message}</div>`);
      await setFieldValueSafe(formFields.isFinished, 'fail');
      cleanupSubscriptions?.();
    }
  };
  window.triggerBraintreeCheckout = triggerBraintreeCheckout;

  // ── Event handlers ─────────────────────────────────────────────────────────

  // When the product selection changes, reset checkout so a new session is required.
  if (formFields.ProductSelection) {
    LFForm.onFieldChange(
      async () => {
        await renderCheckoutButton(false);
        try { await closeCheckoutUi(); } catch { /* ignore */ }
      },
      withHandlerName(formFields.ProductSelection, 'onProductSelectionChange'),
    );
  }

  // When the lookup rule writes the clientToken to sessionId, latch the credential
  // and enable the button if Cost allows it — same pattern as page3's sessionId handler.
  if (formFields.sessionId) {
    LFForm.onFieldChange(
      async () => {
        try {
          const raw = LFForm.getFieldValues<TextField>(formFields.sessionId);
          if (!extractClientToken(raw) && !hasValidBraintreeKey) return;
          credentialDetected = true;
          const num = formFields.Cost
            ? parseCostValue(LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown)
            : Infinity;
          if (!Number.isNaN(num) && num > 0 && isCheckoutAllowed(formFields)) await renderCheckoutButton(true);
        } catch { /* ignore */ }
      },
      withHandlerName(formFields.sessionId, 'onSessionIdChange'),
    );
  }

  // When Cost changes (manual input), enable or disable the button directly —
  // same pattern as page3. Does not call closeCheckoutUi so the UI is not reset.
  if (formFields.Cost) {
    LFForm.onFieldChange(
      async () => {
        try {
          if (!credentialDetected) return;
          const num = parseCostValue(LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown);
          await renderCheckoutButton(!Number.isNaN(num) && num > 0 && isCheckoutAllowed(formFields));
        } catch { /* ignore */ }
      },
      withHandlerName(formFields.Cost as LFFormId, 'onCostChange'),
    );
  }

  // When finalstatus is written (verification lookup completed), show the result.
  if (formFields.finalstatus) {
    LFForm.onFieldChange(
      async () => {
        try {
          const raw = LFForm.getFieldValues<TextField>(formFields.finalstatus!);
          const status = (Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')).trim();
          if (!status) return;
          const success = ['SUBMITTED_FOR_SETTLEMENT', 'SETTLED', 'AUTHORIZED', 'SETTLING'].includes(status.toUpperCase());
          await setCheckoutResultHtml(
            success
              ? `<div style="color:green"><strong>Payment successful</strong> — ${escapeHtml(status)}</div>`
              : `<div style="color:red"><strong>Payment failed</strong> — ${escapeHtml(status)}</div>`,
          );
        } catch { /* ignore */ }
      },
      withHandlerName(formFields.finalstatus, 'onFinalStatusChange'),
    );
  }

  // ── Initial state ──────────────────────────────────────────────────────────

  await closeCheckoutUi();
  void syncCheckoutButtonState();
};
