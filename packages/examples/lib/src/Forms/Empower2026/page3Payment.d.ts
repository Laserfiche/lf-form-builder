import { LFFormId } from '@lfz/lf-form-types';
export interface Emp2026Window extends Window {
    triggerCheckout: () => Promise<void>;
}
export type PaymentFormFields = {
    sessionId: LFFormId;
    checkoutFrame: LFFormId;
    checkoutSection: LFFormId;
    checkoutSessionResult: LFFormId;
    triggerCheckoutButton: LFFormId;
};
export declare const page3Load: ({ formFields, createCheckoutSessionRuleId, stripeFrameOrigin, messagerChannelId, }: {
    formFields: PaymentFormFields;
    createCheckoutSessionRuleId: number;
    stripeFrameOrigin: string;
    messagerChannelId?: string;
}) => Promise<void>;
