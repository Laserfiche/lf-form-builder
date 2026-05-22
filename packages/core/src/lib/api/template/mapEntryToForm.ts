import { SectionField, type LFFormField, type LFFormId } from '@lfz/lf-form-types';

import { findFieldOrNull } from '@/lib/findFieldByLFFormId';
import {
  DefaultRepositoryAPIOptions,
  resolveDefaultRepositoryAPIOptions,
} from '../repositoryApiHelpers';
import { IEntry, IField } from '@laserfiche/lf-repository-api-client-v2';

export type MapEntryToFormOptions = DefaultRepositoryAPIOptions<{
  makeFieldsDisabled?: boolean | LFFormId[];
  matchFieldBy?: 'label' | LFFormField[] | Record<string, LFFormId>;
  parent?: SectionField;
  metadataFields?: IField[];
  entryInfo?: IEntry;
}>;

/**
 * Sets a form field with generic data. This function is used to set a form field with generic data.
 * It assumes the data is in a valid format, and only converts the structure of the value to meet the field's requirement by type.
 * @param {LFFormField} formField
 * @param {string | { values: string[] }} value
 * @returns {Promise<boolean>}
 * @preserve docs
 */
const setGenericFormFieldWithData = async (
  formField: LFFormField,
  value: string | { values?: string[] },
): Promise<boolean> => {
  const genericArray = typeof value === 'object' ? value : { values: [value] };
  if (genericArray.values && !Array.isArray(genericArray.values)) {
    genericArray.values = [genericArray.values];
  }
  if (
    !genericArray ||
    !genericArray.values ||
    genericArray.values.length === 0 ||
    genericArray.values[0] === null
  ) {
    return false;
  }
  const isInCollection =
    formField.settings.isInCollection || formField.settings.isInTable;
  const values = genericArray.values;
  if (formField.componentType === 'Checkbox') {
    await LFForm.setFieldValues(
      formField,
      isInCollection
        ? values.map((value) => ({ value: [value] }))
        : { value: [values[0]] },
    );
  } else if (
    formField.componentType === 'Radio' ||
    formField.componentType === 'Dropdown'
  ) {
    await LFForm.setFieldValues(
      formField,
      isInCollection
        ? values.map((value) => ({ value: value.toString() }))
        : { value: values[0].toString() },
    );
  } else if (formField.componentType === 'DateTime') {
    await LFForm.setFieldValues(
      formField,
      isInCollection
        ? values.map((value) => ({ dateStr: value, timeStr: '' }))
        : { dateStr: values[0], timeStr: '' },
    );
  } else {
    await LFForm.setFieldValues(
      formField,
      isInCollection ? values : values.join(', '),
    );
  }
  return true;
};
/**
 * Checks if a field id is equal to a field. Can also check equivalence of two fields.
 * @param {LFFormId} id
 * @param {LFFormField} field
 * @returns {boolean}
 * @preserve docs
 */
export const isFieldIdEqualField = (
  id: LFFormId,
  field: LFFormField,
): boolean => {
  if (id.fieldId) return id.fieldId === field.fieldId;
  if (id.variableId) return id.variableId === field.settings.attributeId;
  if (id.variableName) return id.variableName === field.settings.attributeName;
  return false;
};
/**
 * Maps an entry's metadata to a form by matching fields based on the field's label or a custom field id.
 * Optionally disables fields after mapping.
 * @param {MapEntryToFormOptions} param
 * @param {string | number | LFFormId | LFFormField } param.entryIdField
 * @param {string} param.repositoryId
 * @param {RepositoryApiClient} param.apiClient
 * @param {{ makeFieldsDisabled: boolean | LFFormId[], matchFieldBy: 'label' | Record<string, LFFormId> }} param.options
 * @returns {Array<Promise<PromiseSettledResult<LFFormField | null>>>}
 * @preserve docs
 */
export const mapEntryToForm = async ({
  options,
  ...apiOptions
}: MapEntryToFormOptions): Promise<{
  entryInfo: IEntry;
  setFields: PromiseSettledResult<LFFormField | null>[];
}
> => {
  let entryInfo = options.entryInfo;
  let fields = options.metadataFields;
  if (!entryInfo || !fields) {
    const { entryId, repositoryId, apiClient } =
      await resolveDefaultRepositoryAPIOptions(apiOptions);
    entryInfo = await apiClient.entriesClient.getEntry({
      repositoryId,
      entryId,
      select: 'name',
    });
    fields = await apiClient.entriesClient
      .listFields({
        repositoryId,
        entryId,
        formatFieldValues: true,
      })
      .then((v) => v.value);
  }

  const metadataFieldMap =
    fields?.reduce((acc, field) => {
      if (!field.name) return acc;
      acc[field.name] = field;
      return acc;
    }, {} as Record<string, { values?: string[] }>) ?? {};
  metadataFieldMap['Entry Name'] = { values: [entryInfo.name ?? ''] };

  const { makeFieldsDisabled = false, matchFieldBy = 'label' } = options;
  const mappedFields: Promise<LFFormField | null>[] = [];
  if (typeof matchFieldBy === 'string') {
    LFForm.findFields((formField: LFFormField) => {
      const parentField = formField.settings.parentId;
      if (options.parent?.componentId && parentField !== options.parent.componentId) return false;
      const metadataField = metadataFieldMap[formField.settings[matchFieldBy]];
      if (!metadataField) return false;
      mappedFields.push(
        setGenericFormFieldWithData(formField, metadataField).then((result) =>
          result ? formField : null,
        ),
      );
      return false;
    });
  } else if (Array.isArray(matchFieldBy)) {
    matchFieldBy.forEach((fieldId) => {
      const formField = findFieldOrNull(fieldId);
      if (!formField) {
        return;
      }
      const metadataField = metadataFieldMap[formField[0].settings.label];
      if (!metadataField) {
        return;
      }
      mappedFields.push(
        setGenericFormFieldWithData(formField[0], metadataField).then(
          (result) => (result ? formField[0] : null),
        ),
      );
    });
  } else if (typeof matchFieldBy === 'object') {
    Object.entries(matchFieldBy).map(([key, value]) => {
      const formField = findFieldOrNull(value);
      if (!formField) {
        return;
      }
      const metadataField = metadataFieldMap[key];
      mappedFields.push(
        setGenericFormFieldWithData(formField[0], metadataField).then(
          (result) => (result ? formField[0] : null),
        ),
      );
    });
  }
  const setFields = await Promise.allSettled(mappedFields);
  if (makeFieldsDisabled === false) return { entryInfo, setFields};

  await Promise.allSettled(
    setFields.map((result) => {
      if (result.status === 'rejected') return null;
      const field = result.value;
      if (
        field &&
        (makeFieldsDisabled === true ||
          makeFieldsDisabled.findIndex((id) => isFieldIdEqualField(id, field)) >
            -1)
      ) {
        return LFForm.disableFields(field);
      }
      return null;
    }),
  );

  return { entryInfo, setFields };
};
