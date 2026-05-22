import { LFFormField, LFFormId } from '@lf/lf-form-types';

type FieldWithOptionalErrorState = LFFormField & {
  errorMessage?: string;
  isInvalid?: boolean;
  validationMessage?: string;
};

/**
 * Returns true if any matching field appears to be invalid according to
 * its runtime `validation` / `settings` values.
 *
 * Note: does not inspect DOM error nodes — that will be added later if
 * a fallback is desirable.
 */
export const hasFieldError = (field: LFFormId): boolean => {
  try {
    const fields = LFForm.findFieldsByFieldId(field.fieldId ?? -1) as LFFormField[];
    if (!fields || fields.length === 0) return false;

    for (const f of fields) {
      const fieldState = f as FieldWithOptionalErrorState;
      // Field object may expose explicit validation state or settings flags
      if (f?.validation && Object.keys(f.validation).length > 0) return true;
      if (f.settings?.required === true && !f.data) return true;
      // Some runtimes may expose lastChange or other indicators of invalid state
      if (fieldState.isInvalid === true) return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const getFieldErrorMessage = (field: LFFormId): string | null => {
  try {
    const fields = LFForm.findFieldsByFieldId(field.fieldId ?? -1) as LFFormField[];
    if (!fields || fields.length === 0) return null;
    // Look for a validation message on the field object if present
    for (const f of fields) {
      const fieldState = f as FieldWithOptionalErrorState;
      const v = fieldState.validationMessage || fieldState.errorMessage;
      if (v && typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  } catch {
    return null;
  }
};

export default hasFieldError;
