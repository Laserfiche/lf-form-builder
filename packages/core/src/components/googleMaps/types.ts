import type { protos } from '@googlemaps/addressvalidation';
import type { AddressFieldValue, LFFormId } from '@lfz/lf-form-types';

export type InitGoogleMapsAutocompleteOptions = {
  apiKey: string;
  searchField: LFFormId;
  addressField: LFFormId;
  minChars?: number;
  debounceMs?: number;
  maxSuggestions?: number;
  languageCode?: string;
  regionCode?: string;
  includedRegionCodes?: string[];
  requestOptions?: GoogleMapsAutocompleteRequestOptions;
  callbacks?: GoogleMapsAutocompleteCallbacks;
  mapPlaceToAddress?: (place: PlaceDetailsNewResponse) => AddressFieldValue;
  registerToWindowNamespace?: boolean;
  /**
   * Poll the search field value while typing to refresh predictions without requiring blur.
   * Enabled by default.
   */
  searchWhileTyping?: boolean;
  /** Polling interval (ms) for searchWhileTyping updates. */
  searchWhileTypingPollMs?: number;
};

export type GoogleMapsAutocompleteRequestOptions = {
  predictionUrl?: string;
  detailsBaseUrl?: string;
  predictionFieldMask?: string;
  detailsFieldMask?: string;
};

export type GoogleMapsAutocompleteCallbacks = {
  onPredictionsUpdated?: (predictions: PredictionResult[]) => void | Promise<void>;
  onAddressApplied?: (address: AddressFieldValue, place: PlaceDetailsNewResponse) => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export type RuntimeConfig = {
  minChars: number;
  debounceMs: number;
  maxSuggestions: number;
  languageCode?: string;
  regionCode?: string;
  includedRegionCodes?: string[];
  requestOptions: Required<GoogleMapsAutocompleteRequestOptions>;
  callbacks?: GoogleMapsAutocompleteCallbacks;
  mapPlaceToAddress: (place: PlaceDetailsNewResponse) => AddressFieldValue;
  registerToWindowNamespace: boolean;
  searchWhileTyping: boolean;
  searchWhileTypingPollMs: number;
};

export type PredictionResult = {
  text: string;
  placeId: string;
};

export type BindingState = {
  handlerName: string;
  searchField: LFFormId;
  addressField: LFFormId;
  apiKey: string;
  runtimeConfig: RuntimeConfig;
  placeIdByDescription: Map<string, string>;
  currentSessionToken?: string;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  typingPollTimer: ReturnType<typeof setInterval> | null;
  predictionAbortController: AbortController | null;
  detailsAbortController: AbortController | null;
  lastScheduledValue: string;
  requestSeq: number;
  isSelecting: boolean;
  lastSuggestionKey: string;
  lastObservedInputValue: string;
};

export type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
  languageCode?: string;
};

export type PlacePrediction = {
  placePrediction: {
    placeId: string;
    text: {
      text: string;
      matches?: Array<{ startOffset: number; endOffset: number }>;
    };
  };
};

export type AutocompleteNewRequest = {
  input: string;
  sessionToken?: string;
  languageCode?: string;
  regionCode?: string;
  includedRegionCodes?: string[];
};

export type AutocompleteNewResponse = {
  suggestions?: PlacePrediction[];
};

export type PlaceDetailsNewResponse = {
  addressComponents?: AddressComponent[];
};

export type WebServiceErrorResponse = {
  error?: {
    code: number;
    message: string;
    status: string;
  };
};

export type LFCNamespace = {
  initGoogleMapsAutocomplete?: (options: InitGoogleMapsAutocompleteOptions) => Promise<string | undefined>;
  destroyGoogleMapsAutocomplete?: (searchField: LFFormId) => Promise<void>;
  initAddressValidation?: (options: InitAddressValidationOptions) => Promise<void>;
  destroyAddressValidation?: (addressField: LFFormId) => Promise<void>;
  sendValidationFeedback?: (addressField: LFFormId, conclusion: ValidationConclusion) => Promise<void>;
  [key: string]: unknown;
};

export type ValidateAddressRequest = protos.google.maps.addressvalidation.v1.IValidateAddressRequest;
export type ValidateAddressResponse = protos.google.maps.addressvalidation.v1.IValidateAddressResponse;
export type ValidationFeedbackRequest =
  protos.google.maps.addressvalidation.v1.IProvideValidationFeedbackRequest;
export type ValidationFeedbackResponse =
  protos.google.maps.addressvalidation.v1.IProvideValidationFeedbackResponse;
export type ValidationConclusion =
  protos.google.maps.addressvalidation.v1.ProvideValidationFeedbackRequest.ValidationConclusion;
export type Verdict = protos.google.maps.addressvalidation.v1.IVerdict;

export type VerdictInfo = {
  verdict: Verdict;
  original: AddressFieldValue;
  corrected: AddressFieldValue | null;
  responseId: string;
  isConfirmed: boolean;
  hasAddressChanges: boolean;
};

export type VerdictDecision = 'accept' | 'reject' | 'skip';

export type InitAddressValidationOptions = {
  apiKey: string;
  addressField: LFFormId;
  sessionToken?: string;
  onVerdict?: (info: VerdictInfo) => VerdictDecision | Promise<VerdictDecision>;
  normalizeAddressForComparison?: (address: AddressFieldValue) => AddressFieldValue;
  registerToWindowNamespace?: boolean;
};

export type ValidationBinding = {
  handlerName: string;
  addressField: LFFormId;
  apiKey: string;
  sessionToken?: string;
  onVerdict?: (info: VerdictInfo) => VerdictDecision | Promise<VerdictDecision>;
  normalizeAddressForComparison: (address: AddressFieldValue) => AddressFieldValue;
  registerToWindowNamespace: boolean;
  lastResponseId?: string;
  lastResult?: ValidateAddressResponse;
};
