import { describe, expect, it, beforeEach } from 'vitest';
import { setTableFieldValues } from '../../../src/lib/utils/tables/setFieldValues';
import { getLFFormMock, type LFFormTestMock } from '../../mocks/lfForm.mock';

type SetTableFieldValuesLFFormMock = Pick<
  LFFormTestMock,
  'setFieldValues' | 'getFieldValues' | 'addRow' | 'deleteRow' | 'findFieldsByFieldId'
>;

describe('setTableFieldValues', () => {
  beforeEach(() => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    // Default mock for table field lookup
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10, name: 'Name' },
          '1': { fieldId: 11, name: 'Age' },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
  });

  it('sets table values in row order (default)', async () => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10 },
          '1': { fieldId: 11 },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]); // Mock returns empty array

    const values = [
      ['Alice', 30],
      ['Bob', 25],
    ];

    await setTableFieldValues({ fieldId: 1 }, values, { replaceMode: 'replace' });

    expect(lfForm.setFieldValues).toHaveBeenCalledWith(
      { fieldId: 10 },
      ['Alice', 'Bob']
    );
    expect(lfForm.setFieldValues).toHaveBeenCalledWith(
      { fieldId: 11 },
      [30, 25]
    );
  });

  it('updates table row count when in replace mode', async () => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10 },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]);

    const values = [['value1'], ['value2'], ['value3']];

    await setTableFieldValues({ fieldId: 1 }, values, { replaceMode: 'replace' });

    expect(lfForm.addRow).toHaveBeenCalledWith({ fieldId: 1 }, 3);
  });

  it('appends rows when in append mode', async () => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10 },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]);

    const values = [['new1'], ['new2']];

    await setTableFieldValues({ fieldId: 1 }, values, { replaceMode: 'append' });

    expect(lfForm.addRow).toHaveBeenCalledWith({ fieldId: 1 }, 2);
  });

  it('preserves existing values when appending', async () => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10 },
          '1': { fieldId: 11 },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    // Existing table values
    lfForm.getFieldValues.mockReturnValue([
      { value: 'existing1' },
      { value: 'existing2' },
    ]);

    const values = [['new1', 100]];

    await setTableFieldValues({ fieldId: 1 }, values, { replaceMode: 'append' });

    // Verify that setFieldValues was called with existing values prepended
    const calls = lfForm.setFieldValues.mock.calls;
    // First call should be for fieldId: 10 with existing values + new values
    expect(calls[0][0]).toEqual({ fieldId: 10 });
    expect(calls[0][1]).toContain('new1');
  });

  it('sets values in column order when specified', async () => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10 },
          '1': { fieldId: 11 },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]); // Mock returns empty array

    const values = [
      ['Alice', 'Bob'], // Column 0 (Name)
      [30, 25], // Column 1 (Age)
    ];

    await setTableFieldValues({ fieldId: 1 }, values, {
      replaceMode: 'replace',
      valueOrder: 'column',
    });

    expect(lfForm.setFieldValues).toHaveBeenCalledWith(
      { fieldId: 10 },
      ['Alice', 'Bob']
    );
    expect(lfForm.setFieldValues).toHaveBeenCalledWith(
      { fieldId: 11 },
      [30, 25]
    );
  });

  it('returns settled promise results', async () => {
    const lfForm = getLFFormMock<SetTableFieldValuesLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([
      {
        fieldId: 1,
        repeatableTemplate: {
          '0': { fieldId: 10 },
        },
      },
    ]);
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]); // Mock returns empty array

    const values = [['value1']];
    const results = await setTableFieldValues({ fieldId: 1 }, values, {
      replaceMode: 'replace',
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });
});
