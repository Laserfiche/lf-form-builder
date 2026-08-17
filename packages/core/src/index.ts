// Field utilities
export { findField, findFieldByIdParam, findFieldOrNull } from './lib/findFieldByLFFormId';

// Field rules
export { LFFormFieldRules } from './lib/fieldRules/index';

// Utils
export { lfjsx } from './lib/utils/lfjsx';
export { showFieldSafe, hideFieldSafe, setFieldValueSafe } from './lib/utils/fieldVisibility';
export {
  PostMessageHelper,
  type MessageMap,
  type MessageType,
  type PostMessageData,
  type PostMessageEnvelope,
  type MessageValidator,
  type PostMessageHandler,
  type PostMessageHelperOptions,
} from './lib/utils/postMessageHelper';
export { throttle } from './lib/utils/throttle';
export { waitWithTimeout } from './lib/utils/async';
export { setCustomHtml } from './lib/utils/fieldHtml';

// Table utilities
export { fillTableWithGenericResults } from './lib/utils/tables/fillTableWithResults';
export { setTableFieldValues } from './lib/utils/tables/setFieldValues';
export type { SetFieldValueOptions } from './lib/utils/tables/setFieldValues';
export { generateCSV, makeCSVDownloadButton, makeDownloadTriggerButton } from './lib/utils/tables/tableToCSV';
export { updateTableRows } from './lib/utils/tables/updateTableRows';

// API
export { getRepositories } from './lib/api/repository';
export {
  resolveEntryIdField,
  resolveDefaultRepositoryAPIOptions,
} from './lib/api/repositoryApiHelpers';
export type { DefaultRepositoryAPIOptions } from './lib/api/repositoryApiHelpers';

// API — Adobe Sign
export { AdobeSignApi } from './lib/api/adobeSign/index';

// API — Search
export { searchAsync, fillTableWithSearchResults, defaultSearchOptions } from './lib/api/search/search';
export type { SearchOptions } from './lib/api/search/search';

// API — Template
export { mapEntryToForm, isFieldIdEqualField } from './lib/api/template/mapEntryToForm';
export type { MapEntryToFormOptions } from './lib/api/template/mapEntryToForm';
export { patchEntryMetadata } from './lib/api/template/patchEntryMetadata';
export type { PatchEntryMetadataOptions } from './lib/api/template/patchEntryMetadata';

// Components
export { fieldFormatter } from './components/fieldFormatter';
export type { SupportedFieldTypes } from './components/fieldFormatter';
export { generateFullFieldHtml, fullFieldHtml, type FullFieldHtmlOptions } from './components/fullFieldHtml';
export { makeLoadingBar, type LoadingBarOptions } from './components/makeLoadingBar';
export { registerFirstTimeLoad } from './components/lookupLoading';
export type {
  LookupLoadTimeout,
  LookupLoadingOptions,
  RegisterFirstTimeLoadParams,
} from './components/lookupLoading';
export {
  initGoogleMapsAutocomplete,
  destroyGoogleMapsAutocomplete,
  buildLFAddress,
} from './components/googleMaps/autocomplete';
export {
  initAddressValidation,
  destroyAddressValidation,
  sendValidationFeedback,
  validateAddress,
  validateFeedback,
} from './components/googleMaps/addressValidation';
export type {
  InitGoogleMapsAutocompleteOptions,
  GoogleMapsAutocompleteRequestOptions,
  GoogleMapsAutocompleteCallbacks,
  PredictionResult,
  PlaceDetailsNewResponse,
  InitAddressValidationOptions,
  VerdictDecision,
  VerdictInfo,
  ValidationConclusion,
} from './components/googleMaps/types';

// Components — Star Rating
export {
  registerStarHandler,
  registerAllStarComponents,
  handleVoteChange,
  onVoteChange,
} from './components/starRating';
export type { StarHandlerOptions, OnClickEvent, StarRatingWindow } from './components/starRating';

// Components — Modal
export { LFFormModal } from './components/modal/index';
export {
  LFFormButtonStyle,
  LFFormModalSize,
  LFFormModalTypes,
} from './components/modal/modal.types';
export type {
  LFFormButton,
  LFFormButtonStyleEnum,
  LFFormModalSizeEnum,
  LFFormModalTypesEnum,
  LFFormModalOptions,
  LFFormModalDetails,
  ModalWindow,
} from './components/modal/modal.types';

// Components — Repository
export { DocView } from './components/repository/docView';
export type { DocViewOptions } from './components/repository/docView';
export { IframeView } from './components/repository/iframe';
export type { IframeOptions, IframeWindow } from './components/repository/iframe';
// Payment plugins
export type { StripeMessages } from './plugins/Stripe/index';
export { initStripeIframe, STRIPE_SDK_URL } from './plugins/Stripe/index';
export { initBraintreeIframe, BRAINTREE_DROPIN_SDK_URL } from './plugins/Braintree/index';
export { initAuthorizeNetIframe } from './plugins/AuthorizeNet/index';
export {
  ALLOWED_GATEWAY_SDK_ORIGINS,
  isAllowedGatewayScriptUrl,
  loadGatewayScript,
} from './lib/utils/loadGatewayScript';
