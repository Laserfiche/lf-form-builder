import { LFFormId, AddressFieldValue } from "@lfz/lf-form-types";

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

type RuntimeConfig = {
  minChars: number;
  debounceMs: number;
  maxSuggestions: number;
  languageCode?: string;
  regionCode?: string;
  includedRegionCodes?: string[];
};

type PredictionResult = {
  text: string;
  placeId: string;
};

type BindingState = {
  handlerName: string;
  searchField: LFFormId;
  addressField: LFFormId;
  apiKey: string;
  runtimeConfig: RuntimeConfig;
  placeIdByDescription: Map<string, string>;
  currentSessionToken?: string;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  predictionAbortController: AbortController | null;
  detailsAbortController: AbortController | null;
  lastScheduledValue: string;
  requestSeq: number;
  isSelecting: boolean;
  lastSuggestionKey: string;
};

// Places API New types
type AddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
  languageCode?: string;
};

type PlacePrediction = {
  placePrediction: {
    placeId: string;
    text: {
      text: string;
      matches?: Array<{ startOffset: number; endOffset: number }>;
    };
  };
};

type AutocompleteNewRequest = {
  input: string;
  sessionToken?: string;
  languageCode?: string;
  regionCode?: string;
  includedRegionCodes?: string[];
};

type AutocompleteNewResponse = {
  suggestions?: PlacePrediction[];
};

type PlaceDetailsNewResponse = {
  addressComponents?: AddressComponent[];
};

type WebServiceErrorResponse = {
  error?: {
    code: number;
    message: string;
    status: string;
  };
};

const DEFAULT_MIN_CHARS = 2;
const DEFAULT_DEBOUNCE_MS = 250;
const DEFAULT_MAX_SUGGESTIONS = 8;
const FIELD_CHANGE_HANDLER_NAME = "initGoogleMapsAutocomplete";

const EMPTY_ADDRESS: AddressFieldValue = {
  address1: "",
  address2: "",
  city: "",
  province: "",
  zipcode: "",
  country: "",
};

const bindings = new Map<string, BindingState>();

function ensureLFCNamespace(): Window["LFC"] {
  window.LFC = window.LFC ?? {};
  return window.LFC;
}

/**
 * Generate a session token for Places API; UUID v4 format.
 * If crypto.randomUUID is unavailable, falls back to a simple random token.
 */
function generateSessionToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Fetch autocomplete suggestions from Places API (New) web-service endpoint.
 * Returns array of suggestion objects with placeId and display text.
 */
async function getPredictions(binding: BindingState, input: string): Promise<PredictionResult[]> {
  if (!input.trim() || !binding.apiKey) return [];

  const request: AutocompleteNewRequest = {
    input: input.trim(),
    sessionToken: binding.currentSessionToken,
  };

  if (binding.runtimeConfig.languageCode) {
    request.languageCode = binding.runtimeConfig.languageCode;
  }
  if (binding.runtimeConfig.regionCode) {
    request.regionCode = binding.runtimeConfig.regionCode;
  }
  if (binding.runtimeConfig.includedRegionCodes?.length) {
    request.includedRegionCodes = binding.runtimeConfig.includedRegionCodes;
  }

  const predictionAbortController = new AbortController();
  try {
    binding.predictionAbortController = predictionAbortController;
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": binding.apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.text,suggestions.placePrediction.placeId",
      },
      body: JSON.stringify(request),
      signal: predictionAbortController.signal,
    });

    if (!response.ok) {
      const error = (await response.json()) as WebServiceErrorResponse;
      console.error(
        "[LF Autocomplete] Autocomplete API error:",
        error.error?.message || response.statusText,
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
  } catch (e) {
    if (isAbortError(e)) {
      return [];
    }
    console.error("[LF Autocomplete] Failed to fetch predictions:", e);
    return [];
  } finally {
    if (binding.predictionAbortController === predictionAbortController) {
      binding.predictionAbortController = null;
    }
  }
}

/**
 * Fetch place details from Places API (New) web-service endpoint.
 * Returns address components for address field population.
 */
async function getDetails(binding: BindingState, placeId: string): Promise<PlaceDetailsNewResponse> {
  if (!placeId || !binding.apiKey) throw new Error("Place ID or API key missing.");

  const detailsAbortController = new AbortController();
  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    // For session token invalidation after successful details fetch
    const params = new URLSearchParams({
      fields: "addressComponents",
    });
    if (binding.currentSessionToken) {
      params.append("sessionToken", binding.currentSessionToken);
    }

    binding.detailsAbortController = detailsAbortController;
    const response = await fetch(`${url}?${params}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": binding.apiKey,
        "X-Goog-FieldMask": "addressComponents",
      },
      signal: detailsAbortController.signal,
    });

    if (!response.ok) {
      const error = (await response.json()) as WebServiceErrorResponse;
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return (await response.json()) as PlaceDetailsNewResponse;
  } catch (e) {
    if (isAbortError(e)) {
      throw e;
    }
    console.error("[LF Autocomplete] Failed to fetch place details:", e);
    throw e;
  } finally {
    if (binding.detailsAbortController === detailsAbortController) {
      binding.detailsAbortController = null;
    }
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException
      ? error.name === "AbortError"
      : typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
  );
}

function clearDebounceTimer(binding: BindingState): void {
  if (!binding.debounceTimer) return;
  clearTimeout(binding.debounceTimer);
  binding.debounceTimer = null;
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
  binding.lastScheduledValue = "";
  abortPredictionRequest(binding);
}

function invalidateSelectionWork(binding: BindingState): void {
  abortDetailsRequest(binding);
  binding.isSelecting = false;
}

function limitPredictions(
  predictions: PredictionResult[],
  maxSuggestions: number,
): PredictionResult[] {
  return predictions.slice(0, maxSuggestions);
}


/**
 * Extract a component value by type from addressComponents array.
 * Uses longText for full name or shortText for abbreviation.
 */
function extractComponent(
  components: AddressComponent[] | undefined,
  type: string,
  useShort = true,
): string {
  if (!components) return "";
  const c = components.find((x) => x.types?.includes(type));
  return c ? (useShort ? c.shortText : c.longText) || "" : "";
}

/**
 * Build LFForm address payload from Place Details addressComponents.
 * Maps place components to LFForm address fields.
 */
function buildLFAddress(place: PlaceDetailsNewResponse): AddressFieldValue {
  const comps = place.addressComponents || [];

  // Extract components by type
  const streetNumber = extractComponent(comps, "street_number", false);
  const streetLine2 = extractComponent(comps, "subpremise", false);
  const route = extractComponent(comps, "route", false);
  const locality = extractComponent(comps, "locality", false);
  const postalTown = extractComponent(comps, "postal_town", false);
  const postal = extractComponent(comps, "postal_code", true);
  const suffix = extractComponent(comps, "postal_code_suffix", true);
  const adminArea1 = extractComponent(comps, "administrative_area_level_1", true);
  const adminArea2 = extractComponent(comps, "administrative_area_level_2", true);
  const country = extractComponent(comps, "country", true);

  return {
    address1: [streetNumber, route].filter(Boolean).join(" ").trim(),
    address2: streetLine2,
    city: locality || postalTown,
    province: adminArea1 || adminArea2,
    zipcode: suffix ? `${postal}-${suffix}` : postal,
    country,
  };
}

async function setSuggestions(binding: BindingState, list: string[]): Promise<void> {
  const key = list.join("\u0001");
  if (key === binding.lastSuggestionKey) return;
  try {
    console.log(list)
    await LFForm.changeFieldSettings(binding.searchField, { autoCompleteValues: list });
    binding.lastSuggestionKey = key;
  } catch (error) {
    console.error("[LF Autocomplete] Failed to update autocomplete suggestions:", error);
  }
}

async function clearSuggestions(binding: BindingState): Promise<void> {
  if (binding.lastSuggestionKey === "") return;
  try {
    await LFForm.changeFieldSettings(binding.searchField, { autoCompleteValues: [] });
  } catch (error) {
    console.error("[LF Autocomplete] Failed to clear autocomplete suggestions:", error);
  } finally {
    binding.lastSuggestionKey = "";
  }
}

async function refreshSuggestions(binding: BindingState, input: string): Promise<void> {
  const trimmed = (input || "").trim();
  if (trimmed.length < binding.runtimeConfig.minChars) {
    invalidatePendingSuggestionWork(binding);
    binding.placeIdByDescription.clear();
    await clearSuggestions(binding);
    return;
  }

  // Generate session token on first autocomplete request
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
  } catch (error) {
    if (mySeq !== binding.requestSeq) return;
    if (isAbortError(error)) return;
    binding.placeIdByDescription.clear();
    await clearSuggestions(binding);
  }
}


function scheduleRefresh(binding: BindingState, value: string): void {
  if (binding.debounceTimer && value === binding.lastScheduledValue) return;
  clearDebounceTimer(binding);
  binding.lastScheduledValue = value;
  binding.debounceTimer = setTimeout(() => {
    binding.debounceTimer = null;
    binding.lastScheduledValue = "";
    void refreshSuggestions(binding, value);
  }, binding.runtimeConfig.debounceMs);
}

async function applySelection(binding: BindingState, value: string): Promise<void> {
  const text = (value || "").trim();

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
    const addr = buildLFAddress(place);
    binding.currentSessionToken = undefined;
    await LFForm.setFieldValues(binding.addressField, addr);
  } catch (e) {
    if (isAbortError(e)) {
      return;
    }
    console.error("[LF Autocomplete] Failed to get place details:", e);
  }
}


function isValidFieldRef(field: unknown): field is LFFormId {
  if (!field || typeof field !== "object") return false;
  const candidate = field as LFFormId;
  return (
    candidate.fieldId !== undefined ||
    candidate.variableName !== undefined ||
    candidate.variableId !== undefined
  );
}

function normalizeOptions(
  options: Partial<InitGoogleMapsAutocompleteOptions>,
): RuntimeConfig {
  const minChars = Number.isFinite(options.minChars)
    ? Math.max(1, Number(options.minChars))
    : DEFAULT_MIN_CHARS;
  const debounceMs = Number.isFinite(options.debounceMs)
    ? Math.max(0, Number(options.debounceMs))
    : DEFAULT_DEBOUNCE_MS;
  const maxSuggestions = Number.isFinite(options.maxSuggestions)
    ? Math.max(1, Number(options.maxSuggestions))
    : DEFAULT_MAX_SUGGESTIONS;

  return {
    minChars,
    debounceMs,
    maxSuggestions,
    languageCode: options.languageCode,
    regionCode: options.regionCode,
    includedRegionCodes: options.includedRegionCodes,
  };
}


function constructFieldHandlerName(fieldRef: LFFormId): string {
  const parts = [
    fieldRef.fieldId !== undefined ? `field:${fieldRef.fieldId}` : "",
    fieldRef.variableId !== undefined ? `variableId:${fieldRef.variableId}` : "",
    fieldRef.variableName ? `variableName:${fieldRef.variableName}` : "",
    fieldRef.index !== undefined ? `index:${fieldRef.index}` : "",
  ].filter(Boolean);

  return parts.length > 0
    ? `${FIELD_CHANGE_HANDLER_NAME}-${parts.join("|")}`
    : FIELD_CHANGE_HANDLER_NAME;
}

function unsubscribeFieldHandler(fieldRef: LFFormId): void {
  LFForm.unsubscribe("fieldChange", {
    ...fieldRef,
    handlerName: constructFieldHandlerName(fieldRef),
  });
}

function resetBindingState(binding: BindingState): void {
  invalidatePendingSuggestionWork(binding);
  invalidateSelectionWork(binding);
  binding.currentSessionToken = undefined;
  binding.placeIdByDescription.clear();
  binding.lastSuggestionKey = "";
}

function createBinding(
  options: InitGoogleMapsAutocompleteOptions,
  handlerName: string,
): BindingState {
  return {
    handlerName,
    searchField: { ...options.searchField },
    addressField: { ...options.addressField },
    apiKey: options.apiKey.trim(),
    runtimeConfig: normalizeOptions(options),
    placeIdByDescription: new Map<string, string>(),
    currentSessionToken: undefined,
    debounceTimer: null,
    predictionAbortController: null,
    detailsAbortController: null,
    lastScheduledValue: "",
    requestSeq: 0,
    isSelecting: false,
    lastSuggestionKey: "",
  };
}

async function destroyBinding(binding: BindingState): Promise<void> {
  unsubscribeFieldHandler(binding.searchField);
  await clearSuggestions(binding);
  resetBindingState(binding);
  bindings.delete(binding.handlerName);
}


function registerFieldHandler(binding: BindingState): void {
  LFForm.onFieldChange(
    () => {
      if (binding.isSelecting) return;
      const currentValue = LFForm.getFieldValues(binding.searchField);
      const current = typeof currentValue === "string" ? currentValue.trim() : "";

      if (current === "") {
        invalidatePendingSuggestionWork(binding);
        binding.placeIdByDescription.clear();
        void clearSuggestions(binding);
        void applySelection(binding, "");
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
    },
    {
      ...binding.searchField,
      handlerName: binding.handlerName,
    },
  );
}

export async function initGoogleMapsAutocomplete(
  options: InitGoogleMapsAutocompleteOptions,
): Promise<string | undefined> {
  if (!options || typeof options !== "object") {
    throw new Error("initGoogleMapsAutocomplete requires an options object.");
  }
  if (typeof options.apiKey !== "string" || options.apiKey.trim() === "") {
    throw new Error("initGoogleMapsAutocomplete requires a non-empty apiKey.");
  }
  if (!isValidFieldRef(options.searchField)) {
    throw new Error("initGoogleMapsAutocomplete requires a valid searchField.");
  }
  if (!isValidFieldRef(options.addressField)) {
    throw new Error("initGoogleMapsAutocomplete requires a valid addressField.");
  }

  const searchField = { ...options.searchField };
  const handlerName = constructFieldHandlerName(searchField);
  const existingBinding = bindings.get(handlerName);

  if (existingBinding) {
    await destroyBinding(existingBinding);
  }

  const binding = createBinding(options, handlerName);

  bindings.set(handlerName, binding);
  registerFieldHandler(binding);
  return binding.currentSessionToken;
}

export async function destroyGoogleMapsAutocomplete(searchField: LFFormId): Promise<void> {
  if (!isValidFieldRef(searchField)) {
    throw new Error("destroyGoogleMapsAutocomplete requires a valid searchField.");
  }

  const handlerName = constructFieldHandlerName(searchField);
  const binding = bindings.get(handlerName);
  if (!binding) return;

  await destroyBinding(binding);
}

const lfcNamespace = ensureLFCNamespace();
lfcNamespace.initGoogleMapsAutocomplete = initGoogleMapsAutocomplete;
lfcNamespace.destroyGoogleMapsAutocomplete = destroyGoogleMapsAutocomplete;