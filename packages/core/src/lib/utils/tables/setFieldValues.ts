import {
  LFFormField,
  LFFormFieldValueType,
  LFFormId,
} from '@lf/lf-form-types';
import { findFieldByIdParam } from '../../findFieldByLFFormId';
import { updateTableRows } from './updateTableRows';

export type SetFieldValueOptions = {
  replaceMode?: 'replace' | 'append';
  valueOrder?: 'row' | 'column';
};
/**
 * @param {LFFormId} tableFieldId table field to set values on
 * @param {LFFormFieldValueType[][]} values values to set on the table, order of values dictated by options.valueOrder
 * @param {SetFieldValueOptions} options replaceMode to replace or append values, valueOrder to set values by row or column
 * @returns a promise showing the result of the setFieldValues operation
 * @preserve docs
 */
export const setTableFieldValues = async (
  tableFieldId: LFFormId,
  values: LFFormFieldValueType[][],
  options: SetFieldValueOptions
) => {
  const { replaceMode = 'replace', valueOrder = 'row' } = options;
  const tableField = findFieldByIdParam<LFFormField>(tableFieldId)[0];

  // handle row counts for the table
  if (replaceMode === 'replace') {
    await updateTableRows(tableFieldId, values.length);
  } else if (replaceMode === 'append') {
    await LFForm.addRow(tableFieldId, values.length);
  }

  // setup the values for the table
  const colNumberToFieldId: Record<number, number> = {};
  const tableTemplate = Object.values(tableField.repeatableTemplate).reduce(
    (acc, field, i) => {
      colNumberToFieldId[i] = field.fieldId;
      acc[field.fieldId] = [];
      return acc;
    },
    {} as Record<string, LFFormFieldValueType[]>
  );
  if (replaceMode === 'append') {
    for (const fieldId of Object.keys(tableTemplate)) {
      tableTemplate[fieldId].push(
        ...LFForm.getFieldValues<LFFormField[]>({ fieldId: Number(fieldId) })
      );
    }
  }
  if (valueOrder === 'row') {
    for (const row of values) {
      for (let col = 0; col < row.length; col++) {
        tableTemplate[colNumberToFieldId[col]].push(row[col]);
      }
    }
  } else if (valueOrder === 'column') {
    for (let col = 0; col < values.length; col++) {
      for (const row of values[col]) {
        tableTemplate[colNumberToFieldId[col]].push(row);
      }
    }
  }
  return Promise.allSettled(
    Object.entries(tableTemplate).map(([fieldId, values]) => {
      return LFForm.setFieldValues({ fieldId: Number(fieldId) }, values);
    })
  );
};
