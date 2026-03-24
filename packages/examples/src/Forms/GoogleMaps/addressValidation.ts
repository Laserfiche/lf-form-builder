import type { protos } from '@googlemaps/addressvalidation';
import { AddressField, AddressFieldValue, LFFormId } from '@lfz/lf-form-types';

type ValidateAddressRequest = protos.google.maps.addressvalidation.v1.IValidateAddressRequest;
type ValidateAddressResponse = protos.google.maps.addressvalidation.v1.IValidateAddressResponse;
type ValidationFeedbackRequest = protos.google.maps.addressvalidation.v1.IProvideValidationFeedbackRequest;
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

type ValidationBinding = {
  handlerName: string;
  addressField: LFFormId;
  apiKey: string;
  sessionToken?: string;
  onVerdict?: (info: VerdictInfo) => VerdictDecision | Promise<VerdictDecision>;
  lastResponseId?: string;
  lastResult?: ValidateAddressResponse;
};

const BASE_URL = 'https://addressvalidation.googleapis.com/v1';
const HANDLER_NAME = 'addressValidation';

const bindings = new Map<string, ValidationBinding>();

function ensureLFCNamespace(): Window['LFC'] {
  window.LFC = window.LFC ?? {};
  return window.LFC;
}

// ── API helpers ──────────────────────────────────────────────────────────────

export const validateAddress = async (
  address: string[],
  apiKey: string,
  sessionToken?: string,
): Promise<ValidateAddressResponse> => {
  const body: ValidateAddressRequest = {
    sessionToken,
    address: { addressLines: address },
  };
  const response = await fetch(`${BASE_URL}:validateAddress?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Address validation request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<ValidateAddressResponse>;
};

type ValidationConclusionKey =
  | 'VALIDATION_CONCLUSION_UNSPECIFIED'
  | 'VALIDATED_VERSION_USED'
  | 'USER_VERSION_USED'
  | 'UNVALIDATED_VERSION_USED'
  | 'UNUSED';

export const validateFeedback = async (
  conclusion: ValidationConclusion | ValidationConclusionKey,
  responseId: string,
  apiKey: string,
): Promise<ValidationFeedbackResponse> => {
  const body: ValidationFeedbackRequest = { responseId, conclusion };
  const response = await fetch(`${BASE_URL}:provideValidationFeedback?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Validation feedback request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<ValidationFeedbackResponse>;
};

// ── Field helpers ────────────────────────────────────────────────────────────

function checkValidAddress(address: AddressFieldValue): boolean {
  return (
    address.address1 !== '' &&
    address.city !== '' &&
    address.province !== '' &&
    address.country !== '' &&
    address.zipcode !== ''
  );
}

function buildAddressLines(value: AddressFieldValue): string[] {
  return [
    value.address1,
    value.address2,
    value.city,
    value.province,
    value.country,
    value.zipcode,
  ].filter(Boolean);
}

function buildAddressFromResponse(response: ValidateAddressResponse): AddressFieldValue | null {
  const postalAddress = response.result?.address?.postalAddress;
  if (!postalAddress) return null;

  const lines = postalAddress.addressLines || [];
  return {
    address1: lines[0] || '',
    address2: lines.length > 1 ? lines.slice(1).join(' ') : '',
    city: postalAddress.locality || '',
    province: postalAddress.administrativeArea || '',
    zipcode: postalAddress.postalCode || '',
    country: postalAddress.regionCode || '',
  };
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

// ── Binding lifecycle ────────────────────────────────────────────────────────

function constructHandlerName(fieldRef: LFFormId): string {
  const parts = [
    fieldRef.fieldId !== undefined ? `field:${fieldRef.fieldId}` : '',
    fieldRef.variableId !== undefined ? `variableId:${fieldRef.variableId}` : '',
    fieldRef.variableName ? `variableName:${fieldRef.variableName}` : '',
    fieldRef.index !== undefined ? `index:${fieldRef.index}` : '',
  ].filter(Boolean);

  return parts.length > 0
    ? `${HANDLER_NAME}-${parts.join('|')}`
    : HANDLER_NAME;
}

function isConfirmedVerdict(verdict: Verdict | null | undefined): boolean {
  if (!verdict) return false;
  return (
    verdict.addressComplete === true &&
    !verdict.hasUnconfirmedComponents &&
    !verdict.hasReplacedComponents &&
    !verdict.hasInferredComponents
  );
}

function createBinding(
  options: InitAddressValidationOptions,
  handlerName: string,
): ValidationBinding {
  return {
    handlerName,
    addressField: { ...options.addressField },
    apiKey: options.apiKey.trim(),
    sessionToken: options.sessionToken,
    onVerdict: options.onVerdict,
    lastResponseId: undefined,
    lastResult: undefined,
  };
}

function destroyBinding(binding: ValidationBinding): void {
  LFForm.unsubscribe('fieldBlur', {
    ...binding.addressField,
    handlerName: binding.handlerName,
  });
  binding.lastResponseId = undefined;
  binding.lastResult = undefined;
  bindings.delete(binding.handlerName);
}

async function applyDecision(
  binding: ValidationBinding,
  decision: VerdictDecision,
  corrected: AddressFieldValue | null,
  responseId: string,
): Promise<void> {
  console.log('[LF AddressValidation] Applying decision:', decision, 'Corrected Address:', corrected);
  switch (decision) {
    case 'accept':
      if (corrected) {
        await LFForm.setFieldValues(binding.addressField, corrected);
      }
      await validateFeedback('VALIDATED_VERSION_USED', responseId, binding.apiKey);
      binding.lastResponseId = undefined;
      break;
    case 'reject':
      await validateFeedback('USER_VERSION_USED', responseId, binding.apiKey);
      binding.lastResponseId = undefined;
      break;
    case 'skip':
      // Caller will handle feedback manually via sendValidationFeedback.
      break;
  }
}

function registerBlurHandler(binding: ValidationBinding): void {
  LFForm.onFieldBlur(
    async () => {
      const value = LFForm.getFieldValues<AddressField>(binding.addressField);
      if (!checkValidAddress(value)) return;

      try {
        const result = await validateAddress(
          buildAddressLines(value),
          binding.apiKey,
          binding.sessionToken,
        );

        binding.lastResult = result;
        const responseId = (result.responseId as string) ?? '';
        binding.lastResponseId = responseId || undefined;

        const verdict = result.result?.verdict ?? {};
        const corrected = buildAddressFromResponse(result);
        const confirmed = isConfirmedVerdict(verdict);

        const info: VerdictInfo = {
          verdict,
          original: value,
          corrected,
          responseId,
          isConfirmed: confirmed,
        };

        if (binding.onVerdict) {
          const decision = await binding.onVerdict(info);
          await applyDecision(binding, decision, corrected, responseId);
        } else {
          // Default: auto-accept confirmed, skip everything else.
          const decision: VerdictDecision = confirmed ? 'accept' : 'skip';
          await applyDecision(binding, decision, corrected, responseId);
        }
      } catch (error) {
        console.error('[LF AddressValidation] Error validating address:', error);
      }
    },
    {
      ...binding.addressField,
      handlerName: binding.handlerName,
    },
  );
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function initAddressValidation(
  options: InitAddressValidationOptions,
): Promise<void> {
  if (!options || typeof options !== 'object') {
    throw new Error('initAddressValidation requires an options object.');
  }
  if (typeof options.apiKey !== 'string' || options.apiKey.trim() === '') {
    throw new Error('initAddressValidation requires a non-empty apiKey.');
  }
  if (!isValidFieldRef(options.addressField)) {
    throw new Error('initAddressValidation requires a valid addressField.');
  }

  const handlerName = constructHandlerName(options.addressField);
  const existing = bindings.get(handlerName);
  if (existing) {
    destroyBinding(existing);
  }

  const binding = createBinding(options, handlerName);
  bindings.set(handlerName, binding);
  registerBlurHandler(binding);
}

export async function destroyAddressValidation(addressField: LFFormId): Promise<void> {
  if (!isValidFieldRef(addressField)) {
    throw new Error('destroyAddressValidation requires a valid addressField.');
  }

  const handlerName = constructHandlerName(addressField);
  const binding = bindings.get(handlerName);
  if (!binding) return;

  destroyBinding(binding);
}

export async function sendValidationFeedback(
  addressField: LFFormId,
  conclusion: ValidationConclusion,
): Promise<void> {
  const handlerName = constructHandlerName(addressField);
  const binding = bindings.get(handlerName);
  if (!binding?.lastResponseId) return;

  await validateFeedback(conclusion, binding.lastResponseId, binding.apiKey);
  binding.lastResponseId = undefined;
}

// ── Register on LFC namespace ────────────────────────────────────────────────

const lfcNamespace = ensureLFCNamespace();
lfcNamespace.initAddressValidation = initAddressValidation;
lfcNamespace.destroyAddressValidation = destroyAddressValidation;
lfcNamespace.sendValidationFeedback = sendValidationFeedback;