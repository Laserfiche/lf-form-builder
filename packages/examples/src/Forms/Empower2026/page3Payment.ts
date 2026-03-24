import { LFFormModal } from '@lfz/lf-form-builder';
import { PostMessageHelper } from './postMessageHelper';
import { StripeMessages } from '../Stripe';
import { LFFormId, TextField } from '@lfz/lf-form-types';

// Interface and Type Declarations
export interface Emp2026Window extends Window {
  triggerCheckout: () => Promise<void>;
}
declare const window: Emp2026Window;

export type PaymentFormFields = {
  sessionId: LFFormId;
  checkoutFrame: LFFormId;
  checkoutSection: LFFormId;
  checkoutSessionResult: LFFormId;
  triggerCheckoutButton: LFFormId;
};

export const page3Load = async ({
  formFields,
  createCheckoutSessionRuleId,
  stripeFrameOrigin,
  messagerChannelId,
}: {
  formFields: PaymentFormFields;
  createCheckoutSessionRuleId: number;
  stripeFrameOrigin: string;
  messagerChannelId?: string;
}) => {
  const stripeOrigin = stripeFrameOrigin;
  const stripeChannelId = messagerChannelId ?? 'empower2026-checkout';

  /**
   * Messages that can be sent between the Stripe embedded checkout iframe
   * and the LFForm sandbox
   */
  const stripeMessager = new PostMessageHelper<StripeMessages>(
    // hostname of the Stripe checkout iframe
    stripeOrigin,
    {
      channelId: stripeChannelId,
      onInvalidMessage: () => {},
      peerDiscovery: true,
    },
  );
  const stripePeerReady = stripeMessager.whenPeerDiscovered();

  // Initialize the checkout modal but do not show it yet
  const checkoutModal = new LFFormModal(
    formFields.checkoutSection,
    'Checkout',
    {
      allowBackdropDismiss: false,
      showBackdrop: true,
      modalType: 'default',
      size: 'xl',
    },
  );
  checkoutModal.setDetails({
    title: 'Checkout',
  });

  /**
   * Function to trigger the checkout process on button click
   * IMPORTANT: This button only shows after the lookup rule to create the checkout session has run once
   * Field rules toggles the visibility of the autofill button and this checkout button
   * That is why this button assumes that the checkout session has already been created and the session ID is available
   */
  const triggerCheckout = async () => {
    void checkoutModal.show();

    await stripePeerReady;

    stripeMessager.send({
      type: 'INITIALIZE',
      payload: { action: 'initialize' },
    });
    const key = LFForm.getFieldValues<TextField>(formFields.sessionId);
    if (key && key.trim() !== '') {
      stripeMessager.send({
        type: 'START_CHECKOUT',
        payload: { key },
      });
    }
  };
  window.triggerCheckout = triggerCheckout;
  const createCheckoutButton = () => {
    return LFForm.changeFieldSettings(formFields.triggerCheckoutButton, {
      content: /*html*/ `<button onclick="triggerCheckout()" class="lf-secondary-button">Checkout</button>`,
    });
  };

  // Lookup triggered on click of checkout (autofill) button
  LFForm.onLookupTrigger(
    async () => {
      // preload the checkout modal
      void checkoutModal.show();
      // Enable the custom checkout button
      void createCheckoutButton();

      await stripePeerReady;

      // Initialize the Stripe checkout iframe
      stripeMessager.send({
        type: 'INITIALIZE',
        payload: { action: 'initialize' },
      });
    },
    { lookupRuleId: createCheckoutSessionRuleId },
  );

  // Notify the Stripe iframe when the session ID field is set
  let didStartCheckout = false;

  LFForm.onFieldChange(
    async () => {
      const key = LFForm.getFieldValues<TextField>(formFields.sessionId);
      if (didStartCheckout || !key || key.trim() === '') {
        return;
      }

      didStartCheckout = true;

      await stripePeerReady;

      // Pass the session ID to the Stripe iframe to start the checkout process
      stripeMessager.send({
        type: 'START_CHECKOUT',
        payload: { key },
      });
      // Unsubscribe from the field change event once the session ID is set
      // The field is hidden when a value exists so no change events will be fired
      LFForm.unsubscribe('fieldChange', {
        ...formFields.sessionId,
        handlerName: 'onSessionIdChange',
      });
    },
    { ...formFields.sessionId, handlerName: 'onSessionIdChange' },
  );

  // Subscribe to the COMPLETE_CHECKOUT message from the Stripe iframe
  stripeMessager.subscribe('COMPLETE_CHECKOUT', async (payload) => {
    await Promise.all([
      checkoutModal.hide(),
      LFForm.setFieldValues<TextField>(
        formFields.checkoutSessionResult,
        payload.result,
      ),
    ]);
  });
};
