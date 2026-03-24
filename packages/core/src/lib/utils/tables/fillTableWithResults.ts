import { LFFormChangeFieldSettingsType, LFFormId, LFFormPromiseResponse, LFFormSetFieldValueType } from '@lfz/lf-form-types';
import { updateTableRows } from './updateTableRows';

type ChangeValueAndSettings = {
  setValue?: LFFormSetFieldValueType;
  changeSettings?: LFFormChangeFieldSettingsType;
};

const isChangeValueAndSettings = (
  val: unknown,
): val is ChangeValueAndSettings => {
  return (
    !!val &&
    typeof val === 'object' &&
    ('setValue' in val || 'changeSettings' in val)
  );
};

/**
 * Fills a table with search results.
 *
 * @param tableFieldId - The ID of the table field.
 * @param results - The search results.
 * @param valueMap - A mapping of field IDs to functions that transform an entry into a field value.
 * @returns A promise that resolves to an array of settled promises, or undefined if there are no results.
 */
export const fillTableWithGenericResults = async <T>(
  tableFieldId: LFFormId,
  results: T[],
  valueMap: {
    [fieldId: number]: (
      entry: T,
    ) => LFFormSetFieldValueType | ChangeValueAndSettings;
  },
): Promise<PromiseSettledResult<LFFormPromiseResponse>[] | undefined> => {
  if (!results) return;
  const fieldValues = Object.keys(valueMap).reduce((acc, fieldId) => {
    acc[fieldId] = { setValue: [], changeSettings: [] };
    return acc;
  }, {} as Record<string, { setValue: LFFormSetFieldValueType[]; changeSettings: LFFormChangeFieldSettingsType[] }>);
  for (const result of results) {
    for (const fieldId of Object.keys(valueMap)) {
      const setter = valueMap[Number(fieldId)](result);
      if (isChangeValueAndSettings(setter)) {
        if ('setValue' in setter && setter.setValue !== undefined) {
          fieldValues[fieldId].setValue.push(setter.setValue);
        }
        if ('changeSettings' in setter && setter.changeSettings !== undefined) {
          fieldValues[fieldId].changeSettings.push(setter.changeSettings);
        }
      } else {
        fieldValues[fieldId].setValue.push(setter);
      }
    }
  }
  await updateTableRows(tableFieldId, results.length);
  return Promise.allSettled(
    Object.entries(fieldValues).map(([fieldId, values]) => {
      const fieldPromises: Promise<LFFormPromiseResponse>[] = [];
      if (values.changeSettings.length) {
        // TODO: make single when LFForm supports it
        fieldPromises.push(
          ...values.changeSettings.map((v, i) =>
            LFForm.changeFieldSettings({ fieldId: Number(fieldId), index: i }, v),
          ),
        );
      }
      if (values.setValue.length) {
        fieldPromises.push(
          LFForm.setFieldValues({ fieldId: Number(fieldId) }, values.setValue),
        );
      }

      return Promise.all(fieldPromises)
        .then(() => ({ success: true } as const))
        .catch((e) => ({ success: false, error: e }));
    }),
  );
};