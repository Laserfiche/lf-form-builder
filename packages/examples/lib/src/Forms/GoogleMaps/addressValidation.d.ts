import type { protos } from '@googlemaps/addressvalidation';
import { AddressFieldValue, LFFormId } from '@lfz/lf-form-types';
type ValidateAddressResponse = protos.google.maps.addressvalidation.v1.IValidateAddressResponse;
type ValidationFeedbackResponse = protos.google.maps.addressvalidation.v1.IProvideValidationFeedbackResponse;
export type ValidationConclusion = protos.google.maps.addressvalidation.v1.ProvideValidationFeedbackRequest.ValidationConclusion;
type Verdict = protos.google.maps.addressvalidation.v1.IVerdict;
export type VerdictInfo = {
    verdict: Verdict;
    original: AddressFieldValue;
    corrected: AddressFieldValue | null;
    responseId: string;
    /** `true` when the API considers the address fully confirmed with no issues. */
    isConfirmed: boolean;
};
/**
 * Return `'accept'` to apply the corrected address and send `VALIDATED_VERSION_USED`,
 * `'reject'` to keep the original and send `USER_VERSION_USED`,
 * or `'skip'` to do nothing (caller handles feedback manually via `sendValidationFeedback`).
 */
export type VerdictDecision = 'accept' | 'reject' | 'skip';
type InitAddressValidationOptions = {
    apiKey: string;
    addressField: LFFormId;
    sessionToken?: string;
    /**
     * Called after every validation with the verdict details.
     * Return a decision or a Promise resolving to one.
     * If omitted, confirmed addresses are auto-accepted and others are skipped.
     */
    onVerdict?: (info: VerdictInfo) => VerdictDecision | Promise<VerdictDecision>;
};
export declare const validateAddress: (address: string[], apiKey: string, sessionToken?: string) => Promise<ValidateAddressResponse>;
type ValidationConclusionKey = 'VALIDATION_CONCLUSION_UNSPECIFIED' | 'VALIDATED_VERSION_USED' | 'USER_VERSION_USED' | 'UNVALIDATED_VERSION_USED' | 'UNUSED';
export declare const validateFeedback: (conclusion: ValidationConclusion | ValidationConclusionKey, responseId: string, apiKey: string) => Promise<ValidationFeedbackResponse>;
export declare function initAddressValidation(options: InitAddressValidationOptions): Promise<void>;
export declare function destroyAddressValidation(addressField: LFFormId): Promise<void>;
export declare function sendValidationFeedback(addressField: LFFormId, conclusion: ValidationConclusion): Promise<void>;
export {};
