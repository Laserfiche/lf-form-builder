import { describe, expect, it } from 'vitest';
import { updateTableRows } from '../../../src/lib/utils/tables/updateTableRows';
import { getLFFormMock, type LFFormTestMock } from '../../mocks/lfForm.mock';

type UpdateTableRowsLFFormMock = Pick<
  LFFormTestMock,
  'getFieldValues' | 'addRow' | 'deleteRow'
>;

describe('updateTableRows', () => {
  it('adds rows when requested rowCount is greater than current rows', async () => {
    const lfForm = getLFFormMock<UpdateTableRowsLFFormMock>();
    lfForm.getFieldValues.mockReturnValue([{ index: 0 }, { index: 1 }]);

    await updateTableRows({ fieldId: 99 }, 5);

    expect(lfForm.addRow).toHaveBeenCalledWith({ fieldId: 99 }, 3);
    expect(lfForm.deleteRow).not.toHaveBeenCalled();
  });

  it('deletes rows in descending index order when requested rowCount is lower', async () => {
    const lfForm = getLFFormMock<UpdateTableRowsLFFormMock>();
    lfForm.getFieldValues.mockReturnValue([
      { index: 0 },
      { index: 1 },
      { index: 2 },
      { index: 3 },
      { index: 4 },
    ]);

    await updateTableRows({ fieldId: 99 }, 2);

    expect(lfForm.deleteRow).toHaveBeenCalledWith({ fieldId: 99 }, 4, 3, 2);
    expect(lfForm.addRow).not.toHaveBeenCalled();
  });

  it('does nothing when rowCount equals current rows', async () => {
    const lfForm = getLFFormMock<UpdateTableRowsLFFormMock>();
    lfForm.getFieldValues.mockReturnValue([{ index: 0 }, { index: 1 }]);

    await updateTableRows({ fieldId: 99 }, 2);

    expect(lfForm.addRow).not.toHaveBeenCalled();
    expect(lfForm.deleteRow).not.toHaveBeenCalled();
  });
});
