import type { AddressFieldValue, LFFormId } from '@lfz/lf-form-types';
import type {
  InitAddressValidationOptions,
  LFCNamespace,
  ValidateAddressResponse,
  ValidationBinding,
  ValidationConclusion,
  ValidationFeedbackResponse,
  Verdict,
  VerdictDecision,
  VerdictInfo,
  ValidateAddressRequest,
  ValidationFeedbackRequest,
} from './types';

const BASE_URL = 'https://addressvalidation.googleapis.com/v1';
const HANDLER_NAME = 'addressValidation';

const bindings = new Map<string, ValidationBinding>();

function ensureLFCNamespace(): LFCNamespace {
  const w = window as Window & { LFC?: LFCNamespace };
  w.LFC = w.LFC ?? {};
  return w.LFC;
}

function defaultNormalizeAddressForComparison(address: AddressFieldValue): AddressFieldValue {
  const normalize = (value: string | undefined) => (value ?? '').trim().toLowerCase();
  return {
    address1: normalize(address.address1),
    address2: normalize(address.address2),
    city: normalize(address.city),
    province: normalize(address.province),
    zipcode: normalize(address.zipcode),
    country: normalize(address.country),
  };
}

function areAddressesEquivalent(
  original: AddressFieldValue,
  corrected: AddressFieldValue | null,
  normalizeAddressForComparison: (address: AddressFieldValue) => AddressFieldValue,
): boolean {
  if (!corrected) return false;
  const a = normalizeAddressForComparison(original);
  const b = normalizeAddressForComparison(corrected);
  return (
    a.address1 === b.address1 &&
    a.address2 === b.address2 &&
    a.city === b.city &&
    a.province === b.province &&
    a.zipcode === b.zipcode &&
    a.country === b.country
  );
}

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

export const validateFeedback = async (
  conclusion: ValidationConclusion
    | 'VALIDATION_CONCLUSION_UNSPECIFIED'
    | 'VALIDATED_VERSION_USED'
    | 'USER_VERSION_USED'
    | 'UNVALIDATED_VERSION_USED'
    | 'UNUSED',
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

function checkValidAddress(address: AddressFieldValue): boolean {
  return (
    address.address1 !== '' &&
    address.city !== '' &&
    address.province !== '' &&
    address.country !== '' &&
    address.zipcode !== ''
  );
}

function isAddressFieldValue(value: unknown): value is AddressFieldValue {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AddressFieldValue>;
  return (
    typeof candidate.address1 === 'string' &&
    typeof candidate.address2 === 'string' &&
    typeof candidate.city === 'string' &&
    typeof candidate.province === 'string' &&
    typeof candidate.zipcode === 'string' &&
    typeof candidate.country === 'string'
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

function constructHandlerName(fieldRef: LFFormId): string {
  const parts = [
    fieldRef.fieldId !== undefined ? `field:${fieldRef.fieldId}` : '',
    fieldRef.variableId !== undefined ? `variableId:${fieldRef.variableId}` : '',
    fieldRef.variableName ? `variableName:${fieldRef.variableName}` : '',
    fieldRef.index !== undefined ? `index:${fieldRef.index}` : '',
  ].filter(Boolean);

  return parts.length > 0 ? `${HANDLER_NAME}-${parts.join('|')}` : HANDLER_NAME;
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

function createBinding(options: InitAddressValidationOptions, handlerName: string): ValidationBinding {
  return {
    handlerName,
    addressField: { ...options.addressField },
    apiKey: options.apiKey.trim(),
    sessionToken: options.sessionToken,
    onVerdict: options.onVerdict,
    normalizeAddressForComparison:
      options.normalizeAddressForComparison ?? defaultNormalizeAddressForComparison,
    registerToWindowNamespace: options.registerToWindowNamespace ?? true,
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
      break;
  }
}

function registerBlurHandler(binding: ValidationBinding): void {
  LFForm.onFieldBlur(
    async () => {
      const rawValue = LFForm.getFieldValues(binding.addressField);
      if (!isAddressFieldValue(rawValue)) return;
      const value = rawValue;
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
        const hasAddressChanges = !areAddressesEquivalent(
          value,
          corrected,
          binding.normalizeAddressForComparison,
        );

        const info: VerdictInfo = {
          verdict,
          original: value,
          corrected,
          responseId,
          isConfirmed: confirmed,
          hasAddressChanges,
        };

        if (binding.onVerdict) {
          const decision = await binding.onVerdict(info);
          await applyDecision(binding, decision, corrected, responseId);
        } else {
          const decision: VerdictDecision = confirmed || !hasAddressChanges ? 'accept' : 'skip';
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

export async function initAddressValidation(options: InitAddressValidationOptions): Promise<void> {
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

  if (binding.registerToWindowNamespace) {
    const lfcNamespace = ensureLFCNamespace();
    lfcNamespace.initAddressValidation = initAddressValidation;
    lfcNamespace.destroyAddressValidation = destroyAddressValidation;
    lfcNamespace.sendValidationFeedback = sendValidationFeedback;
  }
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
