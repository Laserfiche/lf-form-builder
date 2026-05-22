import type { AddressFieldValue, LFFormId } from '@lf/lf-form-types';
import type {
  AddressComponent,
  AutocompleteNewRequest,
  AutocompleteNewResponse,
  BindingState,
  GoogleMapsAutocompleteRequestOptions,
  InitGoogleMapsAutocompleteOptions,
  LFCNamespace,
  PlaceDetailsNewResponse,
  PredictionResult,
  RuntimeConfig,
  WebServiceErrorResponse,
} from './types';

const DEFAULT_MIN_CHARS = 2;
const DEFAULT_DEBOUNCE_MS = 250;
const DEFAULT_MAX_SUGGESTIONS = 8;
const DEFAULT_SEARCH_WHILE_TYPING_POLL_MS = 150;
const FIELD_CHANGE_HANDLER_NAME = 'initGoogleMapsAutocomplete';

const DEFAULT_REQUEST_OPTIONS: Required<GoogleMapsAutocompleteRequestOptions> = {
  predictionUrl: 'https://places.googleapis.com/v1/places:autocomplete',
  detailsBaseUrl: 'https://places.googleapis.com/v1/places',
  predictionFieldMask: 'suggestions.placePrediction.text,suggestions.placePrediction.placeId',
  detailsFieldMask: 'addressComponents',
};

const EMPTY_ADDRESS: AddressFieldValue = {
  address1: '',
  address2: '',
  city: '',
  province: '',
  zipcode: '',
  country: '',
};

const bindings = new Map<string, BindingState>();

function ensureLFCNamespace(): LFCNamespace {
  const w = window as Window & { LFC?: LFCNamespace };
  w.LFC = w.LFC ?? {};
  return w.LFC;
}

function generateSessionToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === 'AbortError'
      : typeof error === 'object' &&
          error !== null &&
          'name' in error &&
          (error as { name?: string }).name === 'AbortError'
  );
}

function clearDebounceTimer(binding: BindingState): void {
  if (!binding.debounceTimer) return;
  clearTimeout(binding.debounceTimer);
  binding.debounceTimer = null;
}

function clearTypingPollTimer(binding: BindingState): void {
  if (!binding.typingPollTimer) return;
  clearInterval(binding.typingPollTimer);
  binding.typingPollTimer = null;
}

function abortPredictionRequest(binding: BindingState): void {
  binding.predictionAbortController?.abort();
  binding.predictionAbortController = null;
}

function abortDetailsRequest(binding: BindingState): void {
  binding.detailsAbortController?.abort();
  binding.detailsAbortController = null;
}

function invalidatePendingSuggestionWork(binding: BindingState): void {
  binding.requestSeq += 1;
  clearDebounceTimer(binding);
  binding.lastScheduledValue = '';
  abortPredictionRequest(binding);
}

function invalidateSelectionWork(binding: BindingState): void {
  abortDetailsRequest(binding);
  binding.isSelecting = false;
}

function limitPredictions(predictions: PredictionResult[], maxSuggestions: number): PredictionResult[] {
  return predictions.slice(0, maxSuggestions);
}

function extractComponent(components: AddressComponent[] | undefined, type: string, useShort = true): string {
  if (!components) return '';
  const c = components.find((x) => x.types?.includes(type));
  return c ? (useShort ? c.shortText : c.longText) || '' : '';
}

export function buildLFAddress(place: PlaceDetailsNewResponse): AddressFieldValue {
  const comps = place.addressComponents || [];

  const streetNumber = extractComponent(comps, 'street_number', false);
  const streetLine2 = extractComponent(comps, 'subpremise', false);
  const route = extractComponent(comps, 'route', false);
  const locality = extractComponent(comps, 'locality', false);
  const postalTown = extractComponent(comps, 'postal_town', false);
  const postal = extractComponent(comps, 'postal_code', true);
  const suffix = extractComponent(comps, 'postal_code_suffix', true);
  const adminArea1 = extractComponent(comps, 'administrative_area_level_1', true);
  const adminArea2 = extractComponent(comps, 'administrative_area_level_2', true);
  const country = extractComponent(comps, 'country', true);

  return {
    address1: [streetNumber, route].filter(Boolean).join(' ').trim(),
    address2: streetLine2,
    city: locality || postalTown,
    province: adminArea1 || adminArea2,
    zipcode: suffix ? `${postal}-${suffix}` : postal,
    country,
  };
}

async function getPredictions(binding: BindingState, input: string): Promise<PredictionResult[]> {
  if (!input.trim() || !binding.apiKey) return [];

  const request: AutocompleteNewRequest = {
    input: input.trim(),
    sessionToken: binding.currentSessionToken,
  };

  if (binding.runtimeConfig.languageCode) request.languageCode = binding.runtimeConfig.languageCode;
  if (binding.runtimeConfig.regionCode) request.regionCode = binding.runtimeConfig.regionCode;
  if (binding.runtimeConfig.includedRegionCodes?.length) {
    request.includedRegionCodes = binding.runtimeConfig.includedRegionCodes;
  }

  const predictionAbortController = new AbortController();
  try {
    binding.predictionAbortController = predictionAbortController;
    const response = await fetch(binding.runtimeConfig.requestOptions.predictionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': binding.apiKey,
        'X-Goog-FieldMask': binding.runtimeConfig.requestOptions.predictionFieldMask,
      },
      body: JSON.stringify(request),
      signal: predictionAbortController.signal,
    });

    if (!response.ok) {
      const error = (await response.json()) as WebServiceErrorResponse;
      binding.runtimeConfig.callbacks?.onError?.(
        new Error(error.error?.message || response.statusText),
      );
      return [];
    }

    const data = (await response.json()) as AutocompleteNewResponse;
    return (
      data.suggestions?.map((s) => ({
        text: s.placePrediction.text.text,
        placeId: s.placePrediction.placeId,
      })) || []
    );
  } catch (error) {
    if (isAbortError(error)) return [];
    binding.runtimeConfig.callbacks?.onError?.(error);
    return [];
  } finally {
    if (binding.predictionAbortController === predictionAbortController) {
      binding.predictionAbortController = null;
    }
  }
}

async function getDetails(binding: BindingState, placeId: string): Promise<PlaceDetailsNewResponse> {
  if (!placeId || !binding.apiKey) throw new Error('Place ID or API key missing.');

  const detailsAbortController = new AbortController();
  try {
    const url = `${binding.runtimeConfig.requestOptions.detailsBaseUrl}/${encodeURIComponent(placeId)}`;
    const params = new URLSearchParams({
      fields: binding.runtimeConfig.requestOptions.detailsFieldMask,
    });
    if (binding.currentSessionToken) {
      params.append('sessionToken', binding.currentSessionToken);
    }

    binding.detailsAbortController = detailsAbortController;
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': binding.apiKey,
        'X-Goog-FieldMask': binding.runtimeConfig.requestOptions.detailsFieldMask,
      },
      signal: detailsAbortController.signal,
    });

    if (!response.ok) {
      const error = (await response.json()) as WebServiceErrorResponse;
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return (await response.json()) as PlaceDetailsNewResponse;
  } finally {
    if (binding.detailsAbortController === detailsAbortController) {
      binding.detailsAbortController = null;
    }
  }
}

async function setSuggestions(binding: BindingState, list: string[]): Promise<void> {
  const key = list.join('\u0001');
  if (key === binding.lastSuggestionKey) return;
  try {
    await LFForm.changeFieldSettings(binding.searchField, { autoCompleteValues: list });
    binding.lastSuggestionKey = key;
  } catch (error) {
    binding.runtimeConfig.callbacks?.onError?.(error);
  }
}

async function clearSuggestions(binding: BindingState): Promise<void> {
  if (binding.lastSuggestionKey === '') return;
  try {
    await LFForm.changeFieldSettings(binding.searchField, { autoCompleteValues: [] });
  } catch (error) {
    binding.runtimeConfig.callbacks?.onError?.(error);
  } finally {
    binding.lastSuggestionKey = '';
  }
}

async function refreshSuggestions(binding: BindingState, input: string): Promise<void> {
  const trimmed = (input || '').trim();
  if (trimmed.length < binding.runtimeConfig.minChars) {
    invalidatePendingSuggestionWork(binding);
    binding.placeIdByDescription.clear();
    await clearSuggestions(binding);
    return;
  }

  if (!binding.currentSessionToken) {
    binding.currentSessionToken = generateSessionToken();
  }

  abortPredictionRequest(binding);
  const mySeq = ++binding.requestSeq;

  try {
    const predictions = limitPredictions(
      await getPredictions(binding, trimmed),
      binding.runtimeConfig.maxSuggestions,
    );
    if (mySeq !== binding.requestSeq) return;

    binding.placeIdByDescription.clear();
    const list = predictions.map((p) => {
      binding.placeIdByDescription.set(p.text, p.placeId);
      return p.text;
    });

    await setSuggestions(binding, list);
    await binding.runtimeConfig.callbacks?.onPredictionsUpdated?.(predictions);
  } catch (error) {
    if (mySeq !== binding.requestSeq) return;
    if (isAbortError(error)) return;
    binding.placeIdByDescription.clear();
    await clearSuggestions(binding);
    binding.runtimeConfig.callbacks?.onError?.(error);
  }
}

function scheduleRefresh(binding: BindingState, value: string): void {
  if (binding.debounceTimer && value === binding.lastScheduledValue) return;

  clearDebounceTimer(binding);
  binding.lastScheduledValue = value;
  binding.debounceTimer = setTimeout(() => {
    binding.debounceTimer = null;
    binding.lastScheduledValue = '';
    void refreshSuggestions(binding, value);
  }, binding.runtimeConfig.debounceMs);
}

async function applySelection(binding: BindingState, value: string): Promise<void> {
  const text = (value || '').trim();

  if (!text) {
    invalidateSelectionWork(binding);
    binding.currentSessionToken = undefined;
    await LFForm.setFieldValues(binding.addressField, EMPTY_ADDRESS);
    return;
  }

  const placeId = binding.placeIdByDescription.get(text);
  if (!placeId) return;

  try {
    abortDetailsRequest(binding);
    const place = await getDetails(binding, placeId);
    const addr = binding.runtimeConfig.mapPlaceToAddress(place);
    binding.currentSessionToken = undefined;
    await LFForm.setFieldValues(binding.addressField, addr);
    await binding.runtimeConfig.callbacks?.onAddressApplied?.(addr, place);
  } catch (error) {
    if (isAbortError(error)) return;
    binding.runtimeConfig.callbacks?.onError?.(error);
  }
}

function isValidFieldRef(field: unknown): field is LFFormId {
  if (!field || typeof field !== 'object') return false;
  const candidate = field as LFFormId;
  return (
    candidate.fieldId !== undefined ||
    candidate.variableName !== undefined ||
    candidate.variableId !== undefined
  );
}

function normalizeOptions(options: Partial<InitGoogleMapsAutocompleteOptions>): RuntimeConfig {
  const minChars = Number.isFinite(options.minChars)
    ? Math.max(1, Number(options.minChars))
    : DEFAULT_MIN_CHARS;
  const debounceMs = Number.isFinite(options.debounceMs)
    ? Math.max(0, Number(options.debounceMs))
    : DEFAULT_DEBOUNCE_MS;
  const maxSuggestions = Number.isFinite(options.maxSuggestions)
    ? Math.max(1, Number(options.maxSuggestions))
    : DEFAULT_MAX_SUGGESTIONS;

  const searchWhileTypingPollMs = Number.isFinite(options.searchWhileTypingPollMs)
    ? Math.max(50, Number(options.searchWhileTypingPollMs))
    : DEFAULT_SEARCH_WHILE_TYPING_POLL_MS;

  return {
    minChars,
    debounceMs,
    maxSuggestions,
    languageCode: options.languageCode,
    regionCode: options.regionCode,
    includedRegionCodes: options.includedRegionCodes,
    requestOptions: {
      ...DEFAULT_REQUEST_OPTIONS,
      ...options.requestOptions,
    },
    callbacks: options.callbacks,
    mapPlaceToAddress: options.mapPlaceToAddress ?? buildLFAddress,
    registerToWindowNamespace: options.registerToWindowNamespace ?? true,
    searchWhileTyping: options.searchWhileTyping ?? true,
    searchWhileTypingPollMs,
  };
}

function constructFieldHandlerName(fieldRef: LFFormId): string {
  const parts = [
    fieldRef.fieldId !== undefined ? `field:${fieldRef.fieldId}` : '',
    fieldRef.variableId !== undefined ? `variableId:${fieldRef.variableId}` : '',
    fieldRef.variableName ? `variableName:${fieldRef.variableName}` : '',
    fieldRef.index !== undefined ? `index:${fieldRef.index}` : '',
  ].filter(Boolean);

  return parts.length > 0
    ? `${FIELD_CHANGE_HANDLER_NAME}-${parts.join('|')}`
    : FIELD_CHANGE_HANDLER_NAME;
}

function unsubscribeFieldHandler(fieldRef: LFFormId): void {
  LFForm.unsubscribe('fieldChange', {
    ...fieldRef,
    handlerName: constructFieldHandlerName(fieldRef),
  });
}

function resetBindingState(binding: BindingState): void {
  invalidatePendingSuggestionWork(binding);
  invalidateSelectionWork(binding);
  clearTypingPollTimer(binding);
  binding.currentSessionToken = undefined;
  binding.placeIdByDescription.clear();
  binding.lastSuggestionKey = '';
  binding.lastObservedInputValue = '';
}

function createBinding(options: InitGoogleMapsAutocompleteOptions, handlerName: string): BindingState {
  return {
    handlerName,
    searchField: { ...options.searchField },
    addressField: { ...options.addressField },
    apiKey: options.apiKey.trim(),
    runtimeConfig: normalizeOptions(options),
    placeIdByDescription: new Map<string, string>(),
    currentSessionToken: undefined,
    debounceTimer: null,
    typingPollTimer: null,
    predictionAbortController: null,
    detailsAbortController: null,
    lastScheduledValue: '',
    requestSeq: 0,
    isSelecting: false,
    lastSuggestionKey: '',
    lastObservedInputValue: '',
  };
}

async function destroyBinding(binding: BindingState): Promise<void> {
  unsubscribeFieldHandler(binding.searchField);
  await clearSuggestions(binding);
  resetBindingState(binding);
  bindings.delete(binding.handlerName);
}

function processInputValue(binding: BindingState, current: string): void {
  if (binding.isSelecting) return;

  if (current === '') {
    invalidatePendingSuggestionWork(binding);
    binding.placeIdByDescription.clear();
    void clearSuggestions(binding);
    void applySelection(binding, '');
    return;
  }

  if (binding.placeIdByDescription.has(current)) {
    invalidatePendingSuggestionWork(binding);
    binding.isSelecting = true;
    void applySelection(binding, current).finally(() => {
      binding.isSelecting = false;
    });
    return;
  }

  scheduleRefresh(binding, current);
}

function registerFieldHandler(binding: BindingState): void {
  LFForm.onFieldChange(
    () => {
      const currentValue = LFForm.getFieldValues(binding.searchField);
      const current = typeof currentValue === 'string' ? currentValue.trim() : '';
      processInputValue(binding, current);
    },
    {
      ...binding.searchField,
      handlerName: binding.handlerName,
    },
  );
}

function startSearchWhileTypingWatcher(binding: BindingState): void {
  if (!binding.runtimeConfig.searchWhileTyping) return;

  clearTypingPollTimer(binding);
  binding.typingPollTimer = setInterval(() => {
    const currentValue = LFForm.getFieldValues(binding.searchField);
    const current = typeof currentValue === 'string' ? currentValue.trim() : '';
    if (current === binding.lastObservedInputValue) return;

    binding.lastObservedInputValue = current;
    processInputValue(binding, current);
  }, binding.runtimeConfig.searchWhileTypingPollMs);
}


export async function initGoogleMapsAutocomplete(
  options: InitGoogleMapsAutocompleteOptions,
): Promise<string | undefined> {
  if (!options || typeof options !== 'object') {
    throw new Error('initGoogleMapsAutocomplete requires an options object.');
  }
  if (typeof options.apiKey !== 'string' || options.apiKey.trim() === '') {
    throw new Error('initGoogleMapsAutocomplete requires a non-empty apiKey.');
  }
  if (!isValidFieldRef(options.searchField)) {
    throw new Error('initGoogleMapsAutocomplete requires a valid searchField.');
  }
  if (!isValidFieldRef(options.addressField)) {
    throw new Error('initGoogleMapsAutocomplete requires a valid addressField.');
  }

  const handlerName = constructFieldHandlerName(options.searchField);
  const existingBinding = bindings.get(handlerName);
  if (existingBinding) {
    await destroyBinding(existingBinding);
  }

  const binding = createBinding(options, handlerName);
  bindings.set(handlerName, binding);
  registerFieldHandler(binding);
  startSearchWhileTypingWatcher(binding);

  if (binding.runtimeConfig.registerToWindowNamespace) {
    const lfcNamespace = ensureLFCNamespace();
    lfcNamespace.initGoogleMapsAutocomplete = initGoogleMapsAutocomplete;
    lfcNamespace.destroyGoogleMapsAutocomplete = destroyGoogleMapsAutocomplete;
  }

  return binding.currentSessionToken;
}

export async function destroyGoogleMapsAutocomplete(searchField: LFFormId): Promise<void> {
  if (!isValidFieldRef(searchField)) {
    throw new Error('destroyGoogleMapsAutocomplete requires a valid searchField.');
  }

  const handlerName = constructFieldHandlerName(searchField);
  const binding = bindings.get(handlerName);
  if (!binding) return;

  await destroyBinding(binding);
}
