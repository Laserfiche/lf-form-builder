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

/** URL for the Stripe embedded checkout SDK. */
export const STRIPE_CDN_URL = 'https://js.stripe.com/clover/stripe.js';

const DISABLE_PAGE3 = import.meta.env.VITE_DISABLE_PAGE3 === 'true';

// Set VITE_STRIPE_PUBLIC_KEY=pk_test_... in .env.local for local dev,
// or as a build-time env var for production.
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.trim();
const hasValidStripePublishableKey =
  !!stripePublishableKey && stripePublishableKey.startsWith('pk_');
const stripeKeyErrorHtml =
  '<div style="color:red"><strong>Stripe configuration error:</strong> ' +
  'Set VITE_STRIPE_PUBLIC_KEY in .env.local to a valid Stripe publishable key (starts with pk_).</div>';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Emp2026Window extends Window {
  triggerCheckout: () => Promise<void>;
}
declare const window: Emp2026Window;

/**
 * Maps each payment-related form field to its LFFormId.
 *
 * Required fields:
 *   checkoutFrame         — CustomHTML field that hosts the Stripe iframe
 *   isFinished            — Text field; set to 'success' or 'fail' on completion
 *   checkoutSessionResult — CustomHTML field that shows success/error messages
 *   triggerCheckoutButton — CustomHTML field that renders the Checkout button
 *   sessionId             — Text field that receives the Stripe client_secret from a lookup rule
 *   transactionId         — Text field for the Stripe session ID after completion
 *
 * Optional fields:
 *   checkoutModal    — Modal field; if present the iframe opens inside a modal
 *   MusicSubscription — When changed, resets checkout so a new session is required
 *   Cost             — Numeric field; Checkout button is disabled when Cost ≤ 0
 *   VerifiedPayment        — Text field; payment status written after server-side verification
 *   VerifiedPaymentAmount  — Number/Currency field; verified amount from the Stripe session
 *   VerifiedCurrencyType   — Text field; currency code from the Stripe session (e.g. 'usd')
 *   VerifiedCustomer       — Text field; Stripe customer ID
 *   VerifiedCustomerName   — Text field; customer name from the Stripe session
 *   VerifiedCustomerEmail  — Text field; customer email from the Stripe session
 */
export type PaymentFormFields = {
  checkoutFrame: LFFormId;
  isFinished: LFFormId;
  checkoutSessionResult: LFFormId;
  triggerCheckoutButton: LFFormId;
  sessionId: LFFormId;
  transactionId: LFFormId;
  checkoutModal?: LFFormId;
  MusicSubscription?: LFFormId;
  Cost?: LFFormId;
  VerifiedPayment?: LFFormId;
  VerifiedPaymentAmount?: LFFormId;
  VerifiedCurrencyType?: LFFormId;
  VerifiedCustomer?: LFFormId;
  VerifiedCustomerName?: LFFormId;
  VerifiedCustomerEmail?: LFFormId;
};

// ─── Form field IDs ───────────────────────────────────────────────────────────
// Update these fieldId values to match your form design.

export const page3FormFields = {
  checkoutFrame:          { fieldId: 20 } as const, // CustomHTML       — hosts the Stripe embedded checkout iframe
  isFinished:             { fieldId: 24 } as const, // Single-line text — set to 'success' or 'fail'
  checkoutSessionResult:  { fieldId: 37 } as const, // CustomHTML       — displays success/error messages
  triggerCheckoutButton:  { fieldId: 23 } as const, // CustomHTML       — renders the Checkout button
  sessionId:              { fieldId: 19 } as const, // Single-line text — lookup rule writes Stripe client_secret (cs_...) here
  transactionId:          { fieldId: 36 } as const, // Single-line text — Stripe session ID written here after completion
  checkoutModal:          { fieldId: 38 } as const, // Modal            — optional; checkout iframe opens inside the modal
  MusicSubscription:      { fieldId: 29 } as const, // Radio/Dropdown   — changing this resets checkout for a new session
  Cost:                   { fieldId: 30 } as const, // Number           — Checkout button disabled when ≤ 0
  VerifiedPayment:        { fieldId: 28 } as const, // Single-line text — payment status written after server verification
  VerifiedPaymentAmount:  { fieldId: 31 } as const, // Number/Currency  — verified amount from Stripe session
  VerifiedCurrencyType:   { fieldId: 32 } as const, // Single-line text — currency code (e.g. 'usd')
  VerifiedCustomer:       { fieldId: 33 } as const, // Single-line text — Stripe customer ID
  VerifiedCustomerName:   { fieldId: 34 } as const, // Single-line text — customer name from Stripe session
  VerifiedCustomerEmail:  { fieldId: 35 } as const, // Single-line text — customer email from Stripe session
} as const;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Extracts a Stripe client_secret from the sessionId field value.
 * The field may hold the secret directly ("cs_...") or as JSON
 * ({ "client_secret": "cs_..." }) depending on the lookup rule setup.
 */
function extractClientSecret(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    if (value.trimStart().startsWith('{')) {
      try { return extractClientSecret(JSON.parse(value) as unknown); } catch { /* not JSON */ }
    }
    const s = value.trim();
    return s.startsWith('cs_') ? s : null;
  }
  if (typeof value === 'object' && value !== null) {
    const secret = (value as Record<string, unknown>).client_secret;
    if (typeof secret === 'string') {
      const s = secret.trim();
      return s.startsWith('cs_') ? s : null;
    }
  }
  return null;
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

const withHandlerName = (
  field: LFFormId,
  handlerName: string,
): LFFormEventSubscribeOptions<'fieldChange'> => ({ ...field, handlerName });

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const getStripeResult = (payload: unknown): string =>
  typeof payload === 'object' && payload !== null &&
  typeof (payload as Record<string, unknown>).result === 'string'
    ? (payload as Record<string, string>).result
    : JSON.stringify(payload ?? {});

const getStripeErrorMessage = (payload: unknown): string =>
  typeof payload === 'object' && payload !== null &&
  typeof (payload as Record<string, unknown>).message === 'string'
    ? (payload as Record<string, string>).message
    : JSON.stringify(payload ?? {});

// ─── page3Load ────────────────────────────────────────────────────────────────

/**
 * Initialises the Stripe embedded-checkout flow on page 3.
 *
 * How it works:
 *   1. A lookup rule creates a Stripe checkout session and writes the
 *      client_secret to the sessionId field.
 *   2. The user clicks the Checkout button rendered into triggerCheckoutButton.
 *   3. triggerCheckout() injects a payment iframe (injectStripeFrame) running
 *      the Stripe embedded checkout via Empower2026.js in stripe-sandbox mode.
 *   4. This script and the iframe communicate via PostMessageHelper
 *      (channelId defaults to 'empower2026-checkout').
 *   5. On completion, isFinished is set to 'success' or 'fail'.
 *
 * To add payments to a new form:
 *   1. Update page3FormFields with the correct field IDs for your form.
 *   2. Set VITE_STRIPE_PUBLIC_KEY=pk_test_... in .env.local.
 *   3. Add a lookup rule that calls the Stripe API and writes the
 *      client_secret to the sessionId field.
 *   4. Call page3Load({ formFields: page3FormFields }) from your page index.
 */
export const page3Load = DISABLE_PAGE3
  ? async () => { console.log('[Empower2026] page3Load disabled via VITE_DISABLE_PAGE3'); }
  : async ({
      formFields,
      messagerChannelId,
    }: {
      formFields: PaymentFormFields;
      messagerChannelId?: string;
    }) => {

  if (typeof LFForm === 'undefined') {
    console.warn('[Empower2026] LFForm not present — skipping page3Load');
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  // Random per page load — makes it harder for a rogue sibling frame to win
  // the __lfEmbedScriptResponse race by guessing a static channel ID.
  const stripeChannelId = messagerChannelId ?? `stripe-${Math.random().toString(36).slice(2, 10)}`;
  // Recreated on each checkout attempt so peer discovery targets the fresh iframe.
  let stripeMessager: PostMessageHelper<StripeMessages> | null = null;
  // Created once and reused if a modal field is configured.
  let checkoutModalInstance: LFFormModal | null = null;

  // ── UI helpers ─────────────────────────────────────────────────────────────

  /** Hides and clears the checkout iframe and result message fields. */
  const closeCheckoutUi = async () => {
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

  /** Writes an HTML message into checkoutSessionResult and shows the field. */
  const setCheckoutResultHtml = async (html: string) => {
    await setCustomHtml(formFields.checkoutSessionResult, html);
    await showFieldSafe(formFields.checkoutSessionResult);
  };

  /** Renders the Checkout button. Pass enabled=false to show it as disabled. */
  const renderCheckoutButton = (enabled = true, helperText = '') => {
    const html = /*html*/`
      <button type="button" onclick="triggerCheckout()" class="lf-secondary-button" ${enabled ? '' : 'disabled'}>
        Checkout
      </button>
      ${helperText ? `<div style="margin-top:0.5rem;color:#b42318;font-size:0.875rem;">${helperText}</div>` : ''}
    `;
    return setCustomHtml(formFields.triggerCheckoutButton, html);
  };

  /**
   * Enables the Checkout button when a valid Stripe key is configured
   * and the Cost field (if mapped) contains a positive number.
   */
  const syncCheckoutButtonState = async () => {
    if (!hasValidStripePublishableKey) {
      await renderCheckoutButton(false, 'Stripe checkout unavailable — set VITE_STRIPE_PUBLIC_KEY to a valid pk_ key in .env.local.');
      await closeCheckoutUi();
      return;
    }
    if (formFields.Cost) {
      const num = parseCostValue(LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown);
      const enabled = !Number.isNaN(num) && num > 0;
      await renderCheckoutButton(enabled);
      if (!enabled) await closeCheckoutUi();
      return;
    }
    await renderCheckoutButton(false);
    await closeCheckoutUi();
  };

  // ── Stripe iframe ──────────────────────────────────────────────────────────

  /** (Re)creates the PostMessageHelper that talks to the Stripe payment iframe. */
  const createMessager = () => {
    stripeMessager?.destroy?.();
    stripeMessager = new PostMessageHelper<StripeMessages>(window.location.origin, {
      channelId: stripeChannelId,
      onInvalidMessage: () => {},
      peerDiscovery: true,
    });
    return stripeMessager;
  };

  /**
   * Injects the Stripe payment iframe into the form.
   *
   * The iframe loads sandbox.html, which receives the Empower2026.js code
   * inline from this script via postMessage (no CDN fetch needed). Params
   * are passed as flat hash fragment params — sandbox.html reads them and
   * sets window.__lfSandboxParams before evaluating the script.
   */
  const injectStripeFrame = () => {
    const frameParams = new URLSearchParams({
      rootId: 'checkout',
      mode: 'stripe-sandbox',
      channelId: stripeChannelId,
      pk: stripePublishableKey ?? '',
      scriptSrc: STRIPE_CDN_URL,
    });
    const sandboxHtmlUrl = `${window.location.origin}${window.location.pathname}`;
    const framedSrc = `${sandboxHtmlUrl}#${frameParams}`;
    console.log('[page3Payment] injectStripeFrame —', sandboxHtmlUrl);

    const iframeHtml = `<iframe id="stripe-checkout-iframe" class="stripe-checkout-iframe"
      src="${framedSrc}" width="100%" height="750" frameborder="0" scrolling="no"
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
   * Reads the client_secret from the sessionId field and sends START_CHECKOUT
   * to the Stripe iframe. Returns false if the secret is missing or peer
   * discovery times out (15 s).
   */
  const sendStartCheckout = async (
    peerReady: Promise<void>,
    messager: PostMessageHelper<StripeMessages>,
  ) => {
    const raw = LFForm.getFieldValues<TextField>(formFields.sessionId);
    const clientSecret = extractClientSecret(raw);
    if (!clientSecret) {
      await setCheckoutResultHtml(
        '<div style="color:red"><strong>Stripe error:</strong> Missing client_secret. ' +
        'Ensure the lookup rule writes the Stripe checkout session client_secret to the sessionId field.</div>',
      );
      return false;
    }

    console.log('[page3Payment] waiting for Stripe iframe peer discovery');
    try {
      await waitWithTimeout(peerReady, 15000);
    } catch {
      console.warn('[page3Payment] Stripe peer discovery timed out');
      return false;
    }

    messager.send({
      type: 'START_CHECKOUT',
      payload: { key: clientSecret, sessionId: typeof raw === 'string' ? raw : undefined },
    });
    return true;
  };

  /**
   * Entry point for the checkout flow — called by the Checkout button via
   * window.triggerCheckout().
   *
   * Sequence:
   *   1. Inject the payment iframe (injectStripeFrame)
   *   2. Send the client_secret to the iframe (START_CHECKOUT)
   *   3. Tell the iframe to initialise Stripe (INITIALIZE)
   *   4. Await COMPLETE_CHECKOUT or ERROR, then write isFinished
   */
  const triggerCheckout = async () => {
    console.log('[page3Payment] triggerCheckout called');
    if (!hasValidStripePublishableKey) {
      await setCheckoutResultHtml(stripeKeyErrorHtml);
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
        console.log('[page3Payment] COMPLETE_CHECKOUT:', payload);
        try {
          let result = getStripeResult(payload);
          // cs_ values are client secrets — strip the _secret... suffix so the
          // stored value is the public session ID.
          if (result.startsWith('cs_')) {
            const idx = result.indexOf('_secret');
            if (idx > -1) result = result.substring(0, idx);
          }
          await setCheckoutResultHtml('<div style="color:green"><strong>Payment successfully made</strong></div>');
          await setFieldValueSafe(formFields.isFinished, 'success');
          if (!checkoutModalInstance) await setCustomHtml(formFields.checkoutFrame, '');
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe error:</strong> Error handling completion: ${msg}</div>`);
          await setFieldValueSafe(formFields.isFinished, 'fail');
        }
      });

      unsubscribeError = messager.subscribe('ERROR', async (payload) => {
        if (handled) return;
        handled = true;
        cleanupSubscriptions();
        try {
          await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe error:</strong> ${escapeHtml(getStripeErrorMessage(payload))}</div>`);
          await setFieldValueSafe(formFields.isFinished, 'fail');
          if (!checkoutModalInstance) await setCustomHtml(formFields.checkoutFrame, '');
        } catch { /* ignore */ }
      });

      await injectStripeFrame();
      const peerReady = messager.whenPeerDiscovered();

      if (!await sendStartCheckout(peerReady, messager)) {
        await setFieldValueSafe(formFields.isFinished, 'fail');
        cleanupSubscriptions();
        return;
      }

      messager.send({ type: 'INITIALIZE', payload: { action: 'initialize', pk: stripePublishableKey ?? undefined } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[page3Payment] triggerCheckout error:', message);
      await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe error:</strong> ${message}</div>`);
      await setFieldValueSafe(formFields.isFinished, 'fail');
      cleanupSubscriptions();
    }
  };
  // Expose on window so the Checkout button's onclick="triggerCheckout()" can reach it.
  window.triggerCheckout = triggerCheckout;

  // ── Event handlers ─────────────────────────────────────────────────────────

  // When the subscription option changes, reset checkout so the user must wait
  // for the lookup rule to produce a fresh session before checking out again.
  if (formFields.MusicSubscription) {
    LFForm.onFieldChange(
      async () => {
        await syncCheckoutButtonState();
        await renderCheckoutButton(false);
        try { await closeCheckoutUi(); } catch { /* ignore */ }
      },
      withHandlerName(formFields.MusicSubscription, 'onMusicSubscriptionChange'),
    );
  }

  // When the sessionId field is updated (lookup rule completed), re-enable the
  // Checkout button if a valid client_secret is present and Cost allows it.
  if (formFields.sessionId) {
    LFForm.onFieldChange(
      async () => {
        try {
          if (!extractClientSecret(LFForm.getFieldValues<TextField>(formFields.sessionId))) return;
          const num = formFields.Cost
            ? parseCostValue(LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown)
            : Infinity;
          if (!Number.isNaN(num) && num > 0) await renderCheckoutButton(true);
        } catch { /* ignore */ }
      },
      withHandlerName(formFields.sessionId, 'onSessionIdAfterMusicChange'),
    );
  }

  // ── Initial state ──────────────────────────────────────────────────────────

  await closeCheckoutUi();
  void syncCheckoutButtonState();
};
