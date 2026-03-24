/**
 * Messages that can be sent between the Stripe embedded checkout iframe
 * and the LFForm sandbox
 */
export type StripeMessages = {
    INITIALIZE: {
        action: 'initialize';
    };
    START_CHECKOUT: {
        key: string;
    };
    COMPLETE_CHECKOUT: {
        result: string;
    };
};
