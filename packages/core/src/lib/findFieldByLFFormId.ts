import { LFFormField, LFFormId, LFFormIdParam } from '@lfz/lf-form-types';
/**
 * Finds a field by id and returns an array of fields. Array is empty if not found.
 * @param {LFFormId} field 
 * @returns {LFFormField[]}
 * @preserve docs
 */
export const findField = <FieldType extends LFFormField = LFFormField>(field: LFFormId): FieldType[] => {
  if (field.fieldId) {
    return LFForm.findFieldsByFieldId(field.fieldId) as FieldType[];
  }
  if (field.variableId) {
    return LFForm.findFieldsByVariableId(field.variableId) as FieldType[];
  }
  if (field.variableName) {
    return LFForm.findFieldsByVariableName(field.variableName) as FieldType[];
  }
  throw new Error('Field must have a fieldId, variableId, or variableName');
};
/**
 * Finds a field by id or array of ids and returns an array of fields. Array is empty if not found.
 * @param {LFFormId} fieldId 
 * @returns {LFFormField[]}
 * @preserve docs
 */
export const findFieldByIdParam = <FieldType extends LFFormField = LFFormField>(fieldId: LFFormIdParam): FieldType[] => {
  if (fieldId === undefined || fieldId === null) {
    return [];
  }
  if (Array.isArray(fieldId)) {
    return fieldId.flatMap((f) => findField<FieldType>(f));
  }
  return findField(fieldId);
};
/**
 * Finds a field by id and returns null if no fields are found.
 * @param {LFFormId} field 
 * @returns {LFFormField[]}
 * @preserve docs
 */
export const findFieldOrNull = <FieldType extends LFFormField = LFFormField>(field: LFFormId): FieldType[] | null => {
  const fields = findField<FieldType>(field);
  if (fields.length === 0) {
    return null;
  }

  return fields;
}
