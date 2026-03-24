import { LFFormId } from "@lfz/lf-form-types";
type InitGoogleMapsAutocompleteOptions = {
    apiKey: string;
    searchField: LFFormId;
    addressField: LFFormId;
    minChars?: number;
    debounceMs?: number;
    maxSuggestions?: number;
    languageCode?: string;
    regionCode?: string;
    includedRegionCodes?: string[];
};
export declare function initGoogleMapsAutocomplete(options: InitGoogleMapsAutocompleteOptions): Promise<string | undefined>;
export declare function destroyGoogleMapsAutocomplete(searchField: LFFormId): Promise<void>;
export {};
