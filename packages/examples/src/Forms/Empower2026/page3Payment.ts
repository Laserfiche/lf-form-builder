import {
  PostMessageHelper,
  LFFormModal,
  hideFieldSafe,
  setFieldValueSafe,
  showFieldSafe,
  waitWithTimeout,
  setCustomHtml,
  type StripeMessages,
} from '@lfz/lf-form-builder';
import { LFFormId, TextField } from '@lfz/lf-form-types';

// Interface and Type Declarations
export interface Emp2026Window extends Window {
  triggerCheckout: () => Promise<void>;
}
declare const window: Emp2026Window;

export type PaymentFormFields = {
  MusicSubscription?: LFFormId;


  checkoutFrame: LFFormId;
  checkoutModal?: LFFormId;
  isFinished: LFFormId;
  checkoutSessionResult: LFFormId;
  triggerCheckoutButton: LFFormId;
  


  // These fields are readonly outputs from the checkout session lookup rule, included here for easy reference and type safety when setting values after checkout completion
  sessionId: LFFormId;
  transactionId: LFFormId;
  Cost?: LFFormId;
  VerifiedPayment?: LFFormId;
  VerifiedPaymentAmount?: LFFormId;
  VerifiedCurrencyType?: LFFormId;
  VerifiedCustomer?: LFFormId;
  VerifiedCustomerName?: LFFormId;
  VerifiedCustomerEmail?: LFFormId;
};

// Page-local formFields for page3 (exported so the page index can pass them)
export const page3FormFields = {
  MusicSubscription: { fieldId: 29 } as const,


  checkoutFrame: { fieldId: 20 } as const,
  checkoutModal: { fieldId: 38 } as const,
  checkoutSessionResult: { fieldId: 37 } as const,
  triggerCheckoutButton: { fieldId: 23 } as const,
  isFinished: { fieldId: 24 } as const,
  
  

  sessionId: { fieldId: 19 } as const,
  transactionId: { fieldId: 36 } as const,
  Cost: { fieldId: 30 } as const,
  VerifiedPayment: { fieldId: 28 } as const,
  VerifiedPaymentAmount: { fieldId: 31 } as const,
  VerifiedCurrencyType: { fieldId: 32 } as const,
  VerifiedCustomer: { fieldId: 33 } as const,
  VerifiedCustomerName: { fieldId: 34 } as const,
  VerifiedCustomerEmail: { fieldId: 35 } as const,
} as const;

const DISABLE_PAGE3 = import.meta.env.VITE_DISABLE_PAGE3 === 'true';

export const page3Load = DISABLE_PAGE3
  ? async () => {
      console.log('[Empower2026] page3Load disabled via VITE_DISABLE_PAGE3');
    }
  : async ({
      formFields,
      stripeFrameOrigin,
      stripeFrameUrl,
      messagerChannelId,
    }: {
      formFields: PaymentFormFields;
      stripeFrameOrigin: string;
      stripeFrameUrl?: string;
      messagerChannelId?: string;
    }) => {
  // If we're not running inside the LFForm runtime, bail out to avoid errors and
  // accidental iframe injection during local dev served at root.
  if (typeof LFForm === 'undefined') {
    console.warn('[Empower2026] LFForm is not present; skipping page3Load initialization');
    return;
  }
  const stripeOrigin = stripeFrameOrigin;
  const stripeFrameSrc = stripeFrameUrl ?? `${stripeOrigin.replace(/\/$/, '')}/stripe.html`;
  const stripeChannelId = messagerChannelId ?? 'empower2026-checkout';
  console.log('[page3Payment] stripeFrameSrc:', stripeFrameSrc);

  // Lazily created and recreated each checkout attempt so peer discovery
  // always waits for the current iframe rather than a stale cached window ref.
  let stripeMessager: PostMessageHelper<StripeMessages> | null = null;
  let checkoutModalInstance: LFFormModal | null = null;

  const closeCheckoutUi = async () => {
    // Keep custom HTML off the page unless checkout is actively open.
    await Promise.all([
      LFForm.changeFieldSettings(formFields.checkoutFrame, {
        description: '',
        content: '',
      }),
      LFForm.setFieldValues<TextField>(formFields.checkoutFrame, ''),
    ]);

    await Promise.all([
      LFForm.changeFieldSettings(formFields.checkoutSessionResult, {
        description: '',
        content: '',
      }),
      LFForm.setFieldValues<TextField>(formFields.checkoutSessionResult, ''),
    ]);

    await hideFieldSafe(formFields.checkoutFrame);
    await hideFieldSafe(formFields.checkoutModal);
    await hideFieldSafe(formFields.checkoutSessionResult);
  };

  const openCheckoutUi = async () => {
    await showFieldSafe(formFields.checkoutModal);
  };

  // Initial state: hide modal container and strip checkout frame HTML.
  await closeCheckoutUi();
  // When MusicSubscription changes we wait for the lookup to produce a new
  // sessionId before allowing Checkout again.

  const createMessager = () => {
    stripeMessager?.destroy?.();
    stripeMessager = new PostMessageHelper<StripeMessages>(
      stripeOrigin,
      {
        channelId: stripeChannelId,
        onInvalidMessage: () => {},
        peerDiscovery: true,
      },
    );
    return stripeMessager;
  };



  const sendStartCheckout = async (peerReady: Promise<void>, messager: PostMessageHelper<StripeMessages>) => {
    const raw = LFForm.getFieldValues<TextField>(formFields.sessionId);
    const clientSecret = extractClientSecret(raw);
    if (!clientSecret || clientSecret.trim() === '') {
      await setCheckoutResultHtml(
        `<div style="color:red"><strong>Stripe Return error:</strong> Missing Stripe client_secret. Ensure lookup rule writes checkout session client_secret.</div>`,
      );
      return false;
    }

    // `waitWithTimeout` imported from core — races a promise against a timeout
    // to avoid indefinite waits when peer discovery or other async events
    // may never resolve in some environments.
    console.log('[page3Payment] sendStartCheckout: waiting for stripe peer discovery; clientSecret present:', !!clientSecret);
    try {
      await waitWithTimeout(peerReady, 15000);
      console.log('[page3Payment] stripe peer discovered');
    } catch {
      console.warn('[page3Payment] stripe peer discovery timed out');
      return false;
    }

    try {
      console.log('[page3Payment] sendStartCheckout: sending START_CHECKOUT');
      messager.send({
        type: 'START_CHECKOUT',
        payload: {
          key: clientSecret,
          sessionId: typeof raw === 'string' ? raw : undefined,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe Return error:</strong> ${message}</div>`);
      return false;
    }

    return true;
  };

  /**
   * Function to trigger the checkout process on button click
   * IMPORTANT: This button only shows after the lookup rule to create the checkout session has run once
   * Field rules toggles the visibility of the autofill button and this checkout button
   * That is why this button assumes that the checkout session has already been created and the session ID is available
   */
  const triggerCheckout = async () => {
    console.log('[page3Payment] triggerCheckout called');
    let unsubscribeComplete: (() => void) | undefined;
    let unsubscribeError: (() => void) | undefined;

    const cleanupSubscriptions = () => {
      try {
        unsubscribeComplete?.();
      } catch {
        // ignore
      }
      try {
        unsubscribeError?.();
      } catch {
        // ignore
      }
      unsubscribeComplete = undefined;
      unsubscribeError = undefined;
    };

    try {
      // Reset prior result state so custom HTML remains hidden until a new
      // success/error result is produced.
      await closeCheckoutUi();

      // Recreate messager so peer discovery starts fresh for the new iframe.
      const messager = createMessager();

      // Register listeners before any send() calls so messages cannot race past us.
      let terminalMessageHandled = false;

      unsubscribeComplete = messager.subscribe('COMPLETE_CHECKOUT', async (payload) => {
        if (terminalMessageHandled) return;
        terminalMessageHandled = true;
        cleanupSubscriptions();

        console.log('[page3Payment] COMPLETE_CHECKOUT received:', payload);
        try {
          const resultValue =
            payload && typeof (payload as any).result === 'string'
              ? ((payload as any).result as string)
              : JSON.stringify(payload ?? {});

          // If the Stripe response is a client secret (starts with cs_),
          // normalize it by stripping the trailing _secret... suffix so the
          // stored value is the public session id (up to _secret).
          let normalized = resultValue;
          if (typeof normalized === 'string' && normalized.startsWith('cs_')) {
            const idx = normalized.indexOf('_secret');
            if (idx > -1) normalized = normalized.substring(0, idx);
          }

          await setCheckoutResultHtml(
            `<div style="color:green"><strong>Payment was successfully made</strong></div>`,
          );

          await setFieldValueSafe(formFields.isFinished, 'success');

          if (!checkoutModalInstance) {
            await setCustomHtml(formFields.checkoutFrame, '');
          }
          console.log('[page3Payment] checkout iframe closed after completion');
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[page3Payment] error handling checkout completion:', err);
          await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe Return error:</strong> Error handling completion: ${msg}</div>`);
          await setFieldValueSafe(formFields.isFinished, 'fail');
        }
      });

      unsubscribeError = messager.subscribe('ERROR', async (payload) => {
        if (terminalMessageHandled) return;
        terminalMessageHandled = true;
        cleanupSubscriptions();

        try {
          const msg = payload && (payload as any).message ? (payload as any).message : JSON.stringify(payload ?? {});
          await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe Return error:</strong> ${msg}</div>`);
          await setFieldValueSafe(formFields.isFinished, 'fail');
          if (!checkoutModalInstance) {
            await setCustomHtml(formFields.checkoutFrame, '');
          }
        } catch {
          // ignore
        }
      });

      await injectStripeFrame();
      const peerReady = messager.whenPeerDiscovered();
      const didSendStartCheckout = await sendStartCheckout(peerReady, messager);
      if (!didSendStartCheckout) {
        await setFieldValueSafe(formFields.isFinished, 'fail');
        cleanupSubscriptions();
        return;
      }

      messager.send({
        type: 'INITIALIZE',
        payload: {
          action: 'initialize',
          pk: import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? undefined,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[page3Payment] triggerCheckout failed:', message);
      await setCheckoutResultHtml(`<div style="color:red"><strong>Stripe Return error:</strong> ${message}</div>`);
      await setFieldValueSafe(formFields.isFinished, 'fail');
      cleanupSubscriptions();
    }
  };
  window.triggerCheckout = triggerCheckout;
  const checkoutButtonHtml = /*html*/ `<button type="button" onclick="triggerCheckout()" class="lf-secondary-button">Checkout</button>`;

  const renderCheckoutButton = (enabled = true) => {
    const html = /*html*/ `<button type="button" onclick="triggerCheckout()" class="lf-secondary-button" ${enabled ? '' : 'disabled'}>Checkout</button>`;
    return setCustomHtml(formFields.triggerCheckoutButton, html);
  };

  // `setCustomHtml` imported from core — writes both settings and field value
  // so CustomHTML renders across different LF runtimes.

  const setCheckoutResultHtml = async (html: string) => {
    await setCustomHtml(formFields.checkoutSessionResult, html);
    await showFieldSafe(formFields.checkoutSessionResult);
  };

  // Sync function: enable checkout only when Cost > 0 (numeric). Falls back
  // to disabling when cost is missing or non-numeric. Also hide/show iframe based on enabled state.
  const syncCheckoutButtonState = async () => {
    if (formFields.Cost) {
      try {
        const raw = LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown;
        let num = 0;
        if (typeof raw === 'number') num = raw as number;
        else if (typeof raw === 'string') {
          // strip currency symbols and commas
          const cleaned = (raw as string).replace(/[^0-9.-]+/g, '').trim();
          num = cleaned === '' ? NaN : parseFloat(cleaned);
        } else if (Array.isArray(raw) && raw.length > 0) {
          const first = raw[0];
          if (typeof first === 'number') num = first as number;
          else if (typeof first === 'string') num = parseFloat((first as string).replace(/[^0-9.-]+/g, '').trim());
        }

        const enabled = !Number.isNaN(num) && num > 0;
        await renderCheckoutButton(enabled);
        // Hide iframe when cost is 0 or disabled
        if (!enabled) {
          await closeCheckoutUi();
        }
        return;
      } catch {
        // fall through to default
      }
    }

    await renderCheckoutButton(false);
    // Hide iframe when disabled
    await closeCheckoutUi();
  };

  // When MusicSubscription changes, re-sync the checkout button state and
  // close the iframe so the user must click Checkout to re-open it.
  if (formFields.MusicSubscription) {
    LFForm.onFieldChange(
      async () => {
        await syncCheckoutButtonState();
        // Disable checkout until a new sessionId is written by the lookup
        // that runs after changing subscription options.
        await renderCheckoutButton(false);
        try {
          await closeCheckoutUi();
        } catch {
          // ignore
        }
      },
      { ...formFields.MusicSubscription, handlerName: 'onMusicSubscriptionChange' } as any,
    );
  }

  // When sessionId updates, if we're awaiting a session due to a subscription
  // change, re-enable the Checkout button (only if Cost indicates enabled).
  if (formFields.sessionId) {
    LFForm.onFieldChange(
      async () => {
        try {
          const raw = LFForm.getFieldValues<TextField>(formFields.sessionId);
          const clientSecret = extractClientSecret(raw);
          if (!clientSecret) return;

          // Only enable when Cost indicates checkout should be available
          let enabled = true;
          if (formFields.Cost) {
            const rawCost = LFForm.getFieldValues<TextField>(formFields.Cost as LFFormId) as unknown;
            let num = 0;
            if (typeof rawCost === 'number') num = rawCost as number;
            else if (typeof rawCost === 'string') {
              const cleaned = (rawCost as string).replace(/[^0-9.-]+/g, '').trim();
              num = cleaned === '' ? NaN : parseFloat(cleaned);
            } else if (Array.isArray(rawCost) && rawCost.length > 0) {
              const first = rawCost[0];
              if (typeof first === 'number') num = first as number;
              else if (typeof first === 'string') num = parseFloat((first as string).replace(/[^0-9.-]+/g, '').trim());
            }
            enabled = !Number.isNaN(num) && num > 0;
          }

          if (enabled) {
            await renderCheckoutButton(true);
            // If a modal was previously used and the iframe is open, leave it alone;
            // sessionId updates are intentionally ignored for iframe lifecycle.
          }
        } catch {
          // ignore
        }
      },
      { ...formFields.sessionId, handlerName: 'onSessionIdAfterMusicChange' } as any,
    );
  }

  // sessionId updates are intentionally ignored for iframe lifecycle; iframe
  // is injected only when user clicks the Checkout button.

  // Initial sync
  void syncCheckoutButtonState();

  const injectStripeFrame = (sessionId?: string) => {
    const separator = stripeFrameSrc.includes('?') ? '&' : '?';
    const parentOrigin = window.location.origin;
    const params = `channelId=${encodeURIComponent(stripeChannelId)}&pk=${encodeURIComponent(import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '')}&parentOrigin=${encodeURIComponent(parentOrigin)}` + (sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : '');
    const framedSrc = `${stripeFrameSrc}${separator}${params}`;
    const iframeHtml = `<iframe id="stripe-checkout-iframe" class="stripe-checkout-iframe" src="${framedSrc}" width="100%" height="750" frameborder="0" scrolling="no" allow="payment *"></iframe>`;

    // If a modal field is provided, render the iframe inside an LFFormModal.
    if (formFields.checkoutModal) {
      if (!checkoutModalInstance) {
        checkoutModalInstance = new LFFormModal(formFields.checkoutModal);
        checkoutModalInstance.setDetails({ title: 'Checkout' });
        // When the user closes the modal, hide the backing field and strip
        // custom HTML so no checkout markup remains on the page.
        checkoutModalInstance.onClose('close', () => {
          void closeCheckoutUi();
        });
      }

      void openCheckoutUi();
      checkoutModalInstance.setDetails({ content: iframeHtml });
      return checkoutModalInstance.show();
    }

    // Fallback: render into the checkoutFrame field as before.
    const wrapper = `<div class="stripe-checkout-frame">${iframeHtml}</div>`;
    return setCustomHtml(formFields.checkoutFrame, wrapper);
  };

  /**
   * Extracts the Stripe client secret from field 19.
   * Embedded checkout requires a client_secret value (typically starts with "cs_").
   */
  function extractClientSecret(value: unknown): string | null {
    if (!value) return null;

    if (typeof value === 'string') {
      // If it looks like JSON, try to parse and extract client_secret.
      if (value.trimStart().startsWith('{')) {
        try {
          const parsed = JSON.parse(value) as Record<string, unknown>;
          return extractClientSecret(parsed);
        } catch {
          // not JSON
        }
      }

      const raw = value.trim();
      return raw.startsWith('cs_') ? raw : null;
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      if (typeof obj.client_secret === 'string') {
        const clientSecret = obj.client_secret.trim();
        return clientSecret.startsWith('cs_') ? clientSecret : null;
      }
    }

    return null;
  }
};
