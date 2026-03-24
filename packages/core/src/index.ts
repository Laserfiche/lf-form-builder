// Field utilities
export { findField, findFieldByIdParam, findFieldOrNull } from './lib/findFieldByLFFormId';

// Field rules
export { LFFormFieldRules } from './lib/fieldRules/index';

// Utils
export { lfjsx } from './lib/utils/lfjsx';
export { throttle } from './lib/utils/throttle';

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
export { generateFullFieldHtml, fullFieldHtml } from './components/fullFieldHtml';
export { makeLoadingBar } from './components/makeLoadingBar';

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
