import { LFFormId } from '@lfz/lf-form-types';
/**
 * @preserve
 * @param {LFFormId} lookupRegisterField - The ID of the lookup field to listen for lookup rule changes on
 * @param {number} lookupRuleId - The ID of the lookup rule to listen for
 * @param {number | (() => boolean) | (() => Promise<boolean>)} timeout - The maximum time to wait for the lookup trigger before timing out (in milliseconds) or a function that returns a boolean or a promise that resolves to a boolean indicating whether the timeout condition has been met
 * @return {Promise<void>} - A promise that resolves when the first time load process is complete
 */
export declare const registerFirstTimeLoad: ({ lookupRegisterField, lookupRuleId, timeout, }: {
    lookupRegisterField: LFFormId;
    lookupRuleId: number;
    timeout?: number | (() => boolean) | (() => Promise<boolean>);
}) => Promise<void>;
