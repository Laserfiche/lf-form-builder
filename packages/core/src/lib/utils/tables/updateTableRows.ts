import { LFFormId, LFFormField } from '@lfz/lf-form-types';

/**
 * Updates the number of rows in a table field dynamically by row count
 * @param {LFFormId} tableFieldId table field to update
 * @param {number} rowCount number of rows to update the table to
 * @returns a promise showing the result of the updateTableRows operation
 * @preserve docs
 */
export const updateTableRows = async (
  tableFieldId: LFFormId,
  rowCount: number,
) => {
  const currentTableFieldValues =
    LFForm.getFieldValues<LFFormField[]>(tableFieldId);
  const curRowCount = currentTableFieldValues.length;

  if (curRowCount < rowCount) {
    await LFForm.addRow(tableFieldId, rowCount - curRowCount);
  } else if (curRowCount > rowCount) {
    await LFForm.deleteRow(
      tableFieldId,
      ...Array.from(Array(curRowCount - rowCount)).map(
        (_, i) => curRowCount - i - 1,
      ),
    );
  }
};

