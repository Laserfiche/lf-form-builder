import {
  AddressField,
  CheckboxField,
  DateField,
  LFFormField,
  LFFormFieldValueType,
  RadioField,
} from '@lfz/lf-form-types';
import {
  FieldCollectionResponse,
  IFieldToUpdate,
} from '@laserfiche/lf-repository-api-client-v2';
import {
  DefaultRepositoryAPIOptions,
  resolveDefaultRepositoryAPIOptions,
} from '../repositoryApiHelpers';

/**
 * Get any field's value as a string or string array.
 * Helpful to automatically send form data to the repository regardless of the field's type.
 * @param field field to retrieve value from
 * @param isMultiValue whether the field is a multi-value field to
 * @returns string if isMultiValue is false, string[] if isMultiValue is true
 * @preserve docs
 */
function getFieldValueAsString(
  field: LFFormField,
  isMultiValue: true,
): string[];
function getFieldValueAsString(field: LFFormField, isMultiValue: false): string;
function getFieldValueAsString(
  field: LFFormField,
  isMultiValue: boolean,
): string | string[] {
  const fieldValue = LFForm.getFieldValues(field);
  const valueAsList: LFFormFieldValueType[] = Array.isArray(fieldValue)
    ? fieldValue
    : [fieldValue];
  const output: string[] = valueAsList.map((value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (field.componentType === 'DateTime') {
      const dateVal = value as LFFormFieldValueType<DateField>;
      return new Date(dateVal.dateTimeObj).toISOString();
    }
    if (field.componentType === 'Checkbox') {
      const checkboxVal = value as LFFormFieldValueType<CheckboxField>;
      return checkboxVal.otherChoiceValue
        ? [checkboxVal.otherChoiceValue]
            .concat(checkboxVal.value?.map((v: string | number) => v.toString()) ?? [])
            .join(', ')
        : checkboxVal.value?.map((v: string | number) => v.toString()).join(', ');
    }
    if (field.componentType === 'Radio') {
      const singleValue = value as LFFormFieldValueType<RadioField>;
      return singleValue.otherChoiceValue ?? singleValue.value.toString();
    }
    if (field.componentType === 'Address') {
      const address = value as LFFormFieldValueType<AddressField>;
      return Object.values(address)
        .filter((v) => v && v !== '')
        .join(', ');
    }
    return value.toString();
  });
  return isMultiValue ? output : output.join('; ');
}


/**
 * Options for patching entry metadata.
 */
export type PatchEntryMetadataOptions = DefaultRepositoryAPIOptions<{
  /**
   * New metadata to sync with the entry id
   */
  newMetadata: LFFormField[];
}>;
/**
 * Patch entry metadata with new metadata values. Merges new metadata with existing fields when saving.
 * @param {PatchEntryMetadataOptions} patchEntryMetadataOptions 
 * @returns {Promise<FieldCollectionResponse | undefined>} The fields set in the api call or undefined if nothing was sent
 * @preserve docs
 */
export const patchEntryMetadata = async (patchEntryMetadataOptions: PatchEntryMetadataOptions): Promise<FieldCollectionResponse | undefined> => {
  const {
    options,
    ...apiOptions
  } = patchEntryMetadataOptions;
  if (options.newMetadata.length === 0) return;
  const { apiClient, repositoryId, entryId } =
    await resolveDefaultRepositoryAPIOptions(apiOptions);
  const metadataFields = await apiClient.entriesClient.listFields({
    repositoryId,
    entryId,
    formatFieldValues: false,
  });
  const metadataMap = metadataFields.value?.reduce((acc, field) => {
    if (!field.name) return acc;
    acc[field.name] = {
      name: field.name,
      values: field.values,
      isMultiValue: field.isMultiValue,
    };
    return acc;
  }, {} as Record<string, IFieldToUpdate & { isMultiValue?: boolean }>);
  if (!metadataMap) return;
  for (const formField of options.newMetadata) {
    const metadataField = metadataMap[formField.settings.label];
    if (!metadataField) continue;
    const value = LFForm.getFieldValues(formField);
    if (!value) continue;
    if (metadataField.isMultiValue) {
      metadataField.values = getFieldValueAsString(formField, true);
    } else {
      const newValue = getFieldValueAsString(
        formField,
        metadataField.isMultiValue ?? false,
      );
      metadataField.values = [newValue];
    }
  }
  const request = {
    fields: Object.values(metadataMap),
  } as Parameters<typeof apiClient.entriesClient.setFields>[0]['request'];

  const patchResponse = apiClient.entriesClient.setFields({
    repositoryId,
    entryId,
    request,
  });
  return patchResponse;
};
