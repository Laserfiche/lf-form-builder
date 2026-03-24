import { LFFormId } from '@lfz/lf-form-types';
export type GoogleMaps = {
    addressSearch: LFFormId;
    addressPopulate: LFFormId;
    addressConfirmationModal: LFFormId;
};
export declare const page2Load: ({ formFields, apiKey, }: {
    formFields: GoogleMaps;
    apiKey: string;
}) => Promise<void>;
