import type { LFFormId, LFFormSetFieldValues } from '@lfz/lf-form-types';

const setFieldValuesUnsafe = LFForm.setFieldValues as unknown as (
  field: LFFormId,
  value: unknown,
) => ReturnType<LFFormSetFieldValues>;

/**
 * Best-effort field visibility helper that does not throw when the runtime
 * does not support the visibility API.
 */
export const showFieldSafe = async (field?: LFFormId) => {
  if (!field) return;
  try {
    await LFForm.showFields(field);
  } catch {
    // ignore if runtime does not support showFields
  }
};

/**
 * Best-effort field visibility helper that does not throw when the runtime
 * does not support the visibility API.
 */
export const hideFieldSafe = async (field?: LFFormId) => {
  if (!field) return;
  try {
    await LFForm.hideFields(field);
  } catch {
    // ignore if runtime does not support hideFields
  }
};

/**
 * Best-effort field value setter that returns false on failure instead of throwing.
 */
export const setFieldValueSafe = async (
  field: LFFormId | undefined,
  value: unknown,
) => {
  if (!field) return false;
  try {
    await setFieldValuesUnsafe(field, value);
    return true;
  } catch {
    return false;
  }
};
