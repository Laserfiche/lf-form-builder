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

/**
 * @deprecated Accept.js is no longer loaded as an external script.
 * Tokenization now uses a direct fetch() to Authorize.net's
 * securePaymentContainerRequest endpoint, which avoids CSP script-src
 * restrictions and CDN availability issues.  Kept for reference only.
 */
export const AUTHORIZENET_ACCEPT_JS_URL = 'https://js.authorize.net/v1/Accept.js';

const DISABLE_PAGE5 = import.meta.env.VITE_DISABLE_PAGE5 === 'true';

// Set VITE_AUTHORIZENET_API_LOGIN_ID and VITE_AUTHORIZENET_CLIENT_KEY in .env.local.
// Both are public browser-side values; the merchant transaction key is not used here
// and must never be embedded in the bundle.
const authorizeNetApiLoginId = import.meta.env.VITE_AUTHORIZENET_API_LOGIN_ID?.trim();
const authorizeNetClientKey  = import.meta.env.VITE_AUTHORIZENET_CLIENT_KEY?.trim();

/**
 * Selects the Authorize.net endpoint the iframe tokenizes against:
 * `true` → apitest.authorize.net, `false` → api.authorize.net.
 *
 * Defaults to sandbox when unset, so a missing or misspelled variable can never
 * silently send test credentials at the live endpoint. Going to production
 * requires setting this to `false` *and* repointing the charge/verification
 * lookup rules — see the "Going to production" section of the payment recipe.
 */
const authorizeNetUseSandbox = import.meta.env.VITE_AUTHORIZENET_SANDBOX?.trim() !== 'false';

const hasValidAuthorizeNetKey = !!authorizeNetApiLoginId && !!authorizeNetClientKey;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthorizeNetWindow extends Window {
  triggerAuthorizeNetCheckout: () => Promise<void>;
}
declare const window: AuthorizeNetWindow;

/**
 * Maps each payment-related form field to its LFFormId.
 *
 * Required fields:
 *   checkoutFrame         — CustomHTML field that hosts the Authorize.net iframe (fallback when no modal)
 *   isFinished            — Text field; set to 'charge' to trigger the charge lookup rule
 *   checkoutSessionResult — CustomHTML field that shows success/error messages
 *   triggerCheckoutButton — CustomHTML field that renders the Checkout button
 *   paymentNonce          — Text field where the opaque data JSON is written after tokenization
 *
 * Optional fields:
 *   checkoutModal    — Modal field; if present the iframe opens inside a modal (like Stripe/Braintree)
 *   ProductSelection — When changed, resets checkout
 *   Cost             — Numeric field; Checkout button is disabled when Cost ≤ 0
 *   transactionId    — Written by the charge lookup rule after the charge completes
 *   finalstatus      — Written by the verification lookup rule; shown as success/failure
 *   finalamount             — Written by the verification lookup rule; final charged amount
 *   finalcurrencyIsoCode    — Written by the verification lookup rule; currency ISO code
 *   finalmerchantAccountId  — Written by the verification lookup rule; merchant account ID
 */
export type AuthorizeNetPaymentFormFields = {
  checkoutFrame: LFFormId;
  isFinished: LFFormId;
  checkoutSessionResult: LFFormId;
  triggerCheckoutButton: LFFormId;
  paymentNonce: LFFormId;
  checkoutModal?: LFFormId;
  ProductSelection?: LFFormId;
  Cost?: LFFormId;
  transactionId?: LFFormId;
  finalstatus?: LFFormId;
  finalamount?: LFFormId;
  finalcurrencyIsoCode?: LFFormId;
  finalmerchantAccountId?: LFFormId;
};

// ─── Form field IDs ───────────────────────────────────────────────────────────
// Update these fieldId values to match your Authorize.net form design.

export const page5AuthorizeNetFormFields: AuthorizeNetPaymentFormFields = {
  checkoutFrame:          { fieldId: 62 } as const, // CustomHTML        — hosts the Authorize.net iframe (fallback)
  isFinished:             { fieldId: 64 } as const, // Single-line text  — set to 'charge' to trigger charge lookup
  checkoutSessionResult:  { fieldId: 65 } as const, // CustomHTML        — displays success/error messages
  triggerCheckoutButton:  { fieldId: 66 } as const, // CustomHTML        — renders the Checkout button
  paymentNonce:           { fieldId: 67 } as const, // Single-line text  — JSON { dataDescriptor, dataValue } written here
  checkoutModal:          { fieldId: 68 } as const, // Modal             — optional; iframe opens inside the modal
  ProductSelection:       { fieldId: 70 } as const, // Radio/Dropdown    — changing this resets checkout
  Cost:                   { fieldId: 71 } as const, // Single-line text  — Checkout button disabled when ≤ 0
  transactionId:          { fieldId: 72 } as const, // Single-line text  — charge lookup writes transaction ID here
  finalstatus:            { fieldId: 73 } as const, // Single-line text  — verification lookup writes final status here
  finalamount:            { fieldId: 74 } as const, // Single-line text  — verification lookup writes final amount here
  finalcurrencyIsoCode:   { fieldId: 75 } as const, // Single-line text  — verification lookup writes currency ISO code here
  finalmerchantAccountId: { fieldId: 76 } as const, // Single-line text  — verification lookup writes merchant account ID here
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

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
function isCheckoutAllowed(formFields: AuthorizeNetPaymentFormFields): boolean {
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

// ─── page5AuthorizeNetLoad ────────────────────────────────────────────────────

/**
 * Initialises the Authorize.net payment flow — mirrors page3 (Stripe) exactly.
 *
 * How it works:
 *   1. Set VITE_AUTHORIZENET_API_LOGIN_ID and VITE_AUTHORIZENET_CLIENT_KEY in .env.local.
 *   2. The user clicks Checkout → an iframe running sandbox.html#mode=authorizenet-sandbox
 *      opens inside the modal (or checkoutFrame as fallback).
 *   3. The iframe runs initAuthorizeNetIframe, which renders the card form and
 *      tokenizes via a direct fetch() to Authorize.net (no Accept.js script).
 *   4. PostMessageHelper routes COMPLETE_CHECKOUT (or ERROR) back to this script.
 *   5. On success, JSON { dataDescriptor, dataValue } is written to paymentNonce and
 *      isFinished is set to 'charge' to trigger your charge lookup rule.
 *   6. The charge lookup rule reads paymentNonce + Cost, calls the Authorize.net API,
 *      and writes transactionId.
 *   7. The verification lookup rule reads transactionId and writes finalstatus.
 *
 * To configure for a new form:
 *   1. Update page5AuthorizeNetFormFields with the correct field IDs.
 *   2. Set VITE_AUTHORIZENET_API_LOGIN_ID and VITE_AUTHORIZENET_CLIENT_KEY in .env.local.
 *   3. Add a charge lookup rule that reads paymentNonce and Cost → charges the card.
 *   4. Add a verification lookup rule that reads transactionId → writes finalstatus.
 *   5. Call page5AuthorizeNetLoad({ formFields: page5AuthorizeNetFormFields }) from your index.
 */
export const page5AuthorizeNetLoad = DISABLE_PAGE5
  ? async () => { console.log('[Empower2026] page5AuthorizeNetLoad disabled via VITE_DISABLE_PAGE5'); }
  : async ({
      formFields,
      messagerChannelId,
    }: {
      formFields: AuthorizeNetPaymentFormFields;
      messagerChannelId?: string;
    }) => {

  if (typeof LFForm === 'undefined') {
    console.warn('[Empower2026] LFForm not present — skipping page5AuthorizeNetLoad');
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────

  // Random per page load — makes it harder for a rogue sibling frame to win
  // the __lfEmbedScriptResponse race by guessing a static channel ID.
  const authorizeNetChannelId = messagerChannelId ?? `an-${Math.random().toString(36).slice(2, 10)}`;
  // Recreated on each checkout attempt so peer discovery targets the fresh iframe.
  let authorizeNetMessager: PostMessageHelper<StripeMessages> | null = null;
  // Created once and reused if a modal field is configured.
  let checkoutModalInstance: LFFormModal | null = null;
  // Both env vars are static — latched at startup, same as page3's static Stripe key.
  const credentialDetected = hasValidAuthorizeNetKey;

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const closeCheckoutUi = async () => {
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

  const renderCheckoutButton = async (enabled = true, helperText = '') => {
    const html = /*html*/`
      <button type="button" onclick="triggerAuthorizeNetCheckout()" class="lf-secondary-button" ${enabled ? '' : 'disabled'}>
        Checkout
      </button>
      ${helperText ? `<div style="margin-top:0.5rem;color:#b42318;font-size:0.875rem;">${helperText}</div>` : ''}
    `;
    await setCustomHtml(formFields.triggerCheckoutButton, html);
    await showFieldSafe(formFields.triggerCheckoutButton);
  };

  const syncCheckoutButtonState = async () => {
    if (!credentialDetected) {
      await renderCheckoutButton(
        false,
        'Authorize.net checkout unavailable — set VITE_AUTHORIZENET_API_LOGIN_ID and VITE_AUTHORIZENET_CLIENT_KEY in .env.local.',
      );
      await closeCheckoutUi();
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

  // ── Authorize.net iframe ────────────────────────────────────────────────────

  /** (Re)creates the PostMessageHelper that talks to the Authorize.net payment iframe. */
  const createMessager = () => {
    authorizeNetMessager?.destroy?.();
    authorizeNetMessager = new PostMessageHelper<StripeMessages>(window.location.origin, {
      channelId: authorizeNetChannelId,
      onInvalidMessage: () => {},
      peerDiscovery: true,
    });
    return authorizeNetMessager;
  };

  /**
   * Injects the Authorize.net payment iframe into the modal or checkoutFrame.
   *
   * The iframe loads sandbox.html in authorizenet-sandbox mode, which calls
   * initAuthorizeNetIframe. That handler loads Accept.js and renders the card
   * form. Communication happens via PostMessageHelper (INITIALIZE → card form
   * shown; COMPLETE_CHECKOUT ← tokenized opaqueData returned).
   */
  const injectAuthorizeNetFrame = () => {
    const frameParams = new URLSearchParams({
      rootId:    'checkout',
      mode:      'authorizenet-sandbox',
      channelId: authorizeNetChannelId,
      aid:       authorizeNetApiLoginId ?? '',
      ck:        authorizeNetClientKey  ?? '',
      // sandbox=true → inner iframe calls apitest.authorize.net (sandbox endpoint)
      // sandbox=false → inner iframe calls api.authorize.net (production endpoint)
      sandbox:   authorizeNetUseSandbox ? 'true' : 'false',
    });
    const sandboxHtmlUrl = `${window.location.origin}${window.location.pathname}`;
    const framedSrc = `${sandboxHtmlUrl}#${frameParams}`;
    console.log('[page5AuthorizeNetPayment] injectAuthorizeNetFrame —', sandboxHtmlUrl);

    const iframeHtml = `<iframe id="authorizenet-checkout-iframe"
      src="${framedSrc}" width="100%" height="500" frameborder="0" scrolling="no"
      style="display:block;border:0;outline:0;box-shadow:none;background:transparent;">
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

    return setCustomHtml(formFields.checkoutFrame, `<div class="authorizenet-checkout-frame">${iframeHtml}</div>`);
  };

  // ── Checkout flow ──────────────────────────────────────────────────────────

  /**
   * Entry point for the checkout flow — called by the Checkout button via
   * window.triggerAuthorizeNetCheckout(). Mirrors page3's triggerCheckout exactly.
   *
   * Sequence:
   *   1. Inject the payment iframe (injectAuthorizeNetFrame)
   *   2. Wait for peer discovery (iframe PostMessageHelper connects)
   *   3. Send INITIALIZE with apiLoginId, clientKey, amount
   *   4. Await COMPLETE_CHECKOUT or ERROR from the iframe
   *   5. Write opaqueData JSON to paymentNonce, set isFinished = 'charge'
   */
  const triggerAuthorizeNetCheckout = async () => {
    console.log('[page5AuthorizeNetPayment] triggerAuthorizeNetCheckout called');

    if (!hasValidAuthorizeNetKey) {
      await setCheckoutResultHtml(
        '<div style="color:red"><strong>Authorize.net configuration error:</strong> ' +
        'Set VITE_AUTHORIZENET_API_LOGIN_ID and VITE_AUTHORIZENET_CLIENT_KEY in .env.local.</div>',
      );
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
        console.log('[page5AuthorizeNetPayment] COMPLETE_CHECKOUT:', payload);
        try {
          const resultJson = typeof payload === 'object' && payload !== null &&
            typeof (payload as Record<string, unknown>).result === 'string'
              ? (payload as { result: string }).result
              : JSON.stringify(payload ?? {});

          // The inner sandbox sends JSON.stringify({ dataDescriptor, dataValue }).
          // The lookup rule needs only the raw dataValue string in paymentNonce
          // (dataDescriptor is always "COMMON.ACCEPT.INAPP.PAYMENT" for Accept.js).
          let opaqueDataValue = resultJson;
          try {
            const parsed = JSON.parse(resultJson) as { dataDescriptor?: string; dataValue?: string };
            if (parsed.dataValue) opaqueDataValue = parsed.dataValue;
          } catch { /* if not JSON, treat result as the raw opaque value */ }

          await setFieldValueSafe(formFields.paymentNonce, opaqueDataValue);
          await closeCheckoutUi();
          await setCheckoutResultHtml('<div style="color:#555">Processing payment…</div>');
          await setFieldValueSafe(formFields.isFinished, 'charge');
          await renderCheckoutButton(false);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await setCheckoutResultHtml(
            `<div style="color:red"><strong>Authorize.net error:</strong> ${msg}</div>`,
          );
          await setFieldValueSafe(formFields.isFinished, 'fail');
        }
      });

      unsubscribeError = messager.subscribe('ERROR', async (payload) => {
        if (handled) return;
        handled = true;
        cleanupSubscriptions();
        const message = typeof payload === 'object' && payload !== null &&
          typeof (payload as Record<string, unknown>).message === 'string'
            ? (payload as { message: string }).message
            : JSON.stringify(payload ?? {});
        // Escaped: this text arrives over postMessage and the gateway's own
        // response text can reach it, so it is not safe to treat as markup.
        // Matches how page3 and page4 render their ERROR payloads.
        await setCheckoutResultHtml(
          `<div style="color:red"><strong>Authorize.net error:</strong> ${escapeHtml(message)}</div>`,
        );
        await setFieldValueSafe(formFields.isFinished, 'fail');
      });

      const costRaw = formFields.Cost
        ? LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown
        : null;
      const costNum = costRaw !== null ? parseCostValue(costRaw) : NaN;
      const amount = !Number.isNaN(costNum) && costNum > 0
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(costNum)
        : '';

      await injectAuthorizeNetFrame();

      console.log('[page5AuthorizeNetPayment] waiting for authorizenet iframe peer discovery');
      try {
        await waitWithTimeout(messager.whenPeerDiscovered(), 15000);
      } catch {
        console.warn('[page5AuthorizeNetPayment] authorizenet peer discovery timed out');
        await setCheckoutResultHtml(
          '<div style="color:red"><strong>Authorize.net error:</strong> Payment form timed out. Please try again.</div>',
        );
        await setFieldValueSafe(formFields.isFinished, 'fail');
        cleanupSubscriptions();
        return;
      }

      messager.send({
        type: 'INITIALIZE',
        payload: {
          action:    'initialize',
          apiLoginId: authorizeNetApiLoginId ?? undefined,
          clientKey:  authorizeNetClientKey  ?? undefined,
          amount,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[page5AuthorizeNetPayment] triggerAuthorizeNetCheckout error:', message);
      await setCheckoutResultHtml(
        `<div style="color:red"><strong>Authorize.net error:</strong> ${message}</div>`,
      );
      await setFieldValueSafe(formFields.isFinished, 'fail');
      cleanupSubscriptions();
    }
  };
  // Expose on window so the Checkout button's onclick="triggerAuthorizeNetCheckout()" can reach it.
  window.triggerAuthorizeNetCheckout = triggerAuthorizeNetCheckout;

  // ── Event handlers ─────────────────────────────────────────────────────────

  if (formFields.ProductSelection) {
    LFForm.onFieldChange(
      async () => {
        await renderCheckoutButton(false);
        try { await closeCheckoutUi(); } catch { /* ignore */ }
      },
      withHandlerName(formFields.ProductSelection, 'onAuthorizeNetProductSelectionChange'),
    );
  }

  if (formFields.Cost) {
    LFForm.onFieldChange(
      async () => {
        try {
          if (!credentialDetected) return;
          const num = parseCostValue(LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown);
          await renderCheckoutButton(!Number.isNaN(num) && num > 0 && isCheckoutAllowed(formFields));
        } catch { /* ignore */ }
      },
      withHandlerName(formFields.Cost as LFFormId, 'onAuthorizeNetCostChange'),
    );
  }

  if (formFields.finalstatus) {
    LFForm.onFieldChange(
      async () => {
        try {
          const raw = LFForm.getFieldValues<TextField>(formFields.finalstatus!);
          const status = (Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')).trim();
          if (!status) return;
          const success = [
            '1',
            'approval',
            'approved',
            'this transaction has been approved.',
            'settledsuccessfully',
            'authorizedpendingcapture',
            'capturedpendingsettlement',
          ].includes(status.toLowerCase());
          await setCheckoutResultHtml(
            success
              ? `<div style="color:green"><strong>Payment successful</strong> — ${escapeHtml(status)}</div>`
              : `<div style="color:red"><strong>Payment failed</strong> — ${escapeHtml(status)}</div>`,
          );
        } catch { /* ignore */ }
      },
      withHandlerName(formFields.finalstatus, 'onAuthorizeNetFinalStatusChange'),
    );
  }

  // ── Initial state ──────────────────────────────────────────────────────────

  await closeCheckoutUi();
  void syncCheckoutButtonState();
};
