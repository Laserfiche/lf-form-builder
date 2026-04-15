import { describe, expect, it } from 'vitest';
import { fillTableWithGenericResults } from '../../../../src/lib/utils/tables/fillTableWithResults';
import { getLFFormMock, type LFFormTestMock } from '../../../mocks/lfForm.mock';
import type { LFFormChangeFieldSettingsType, LFFormSetFieldValueType } from '@lfz/lf-form-types';

type FillTableLFFormMock = Pick<
  LFFormTestMock,
  'setFieldValues' | 'changeFieldSettings' | 'getFieldValues' | 'addRow' | 'deleteRow'
>;

describe('fillTableWithGenericResults', () => {
  it('returns empty settled promises when results are empty array', async () => {
    const lfForm = getLFFormMock<FillTableLFFormMock>();
    lfForm.getFieldValues.mockReturnValue([]); // Mock returns empty array
    lfForm.setFieldValues.mockResolvedValue({ success: true });

    const result = await fillTableWithGenericResults(
      { fieldId: 1 },
      [],
      { 10: () => 'value' }
    );

    // Empty results array still returns settled promises (one per field in valueMap)
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result?.length).toBeGreaterThan(0);
  });

  it('returns undefined when results are null/undefined', async () => {
    getLFFormMock<FillTableLFFormMock>();

    const result1 = await fillTableWithGenericResults(
      { fieldId: 1 },
      null as unknown as never[],
      { 10: () => 'value' }
    );
    const result2 = await fillTableWithGenericResults(
      { fieldId: 1 },
      undefined as unknown as never[],
      { 10: () => 'value' }
    );

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });

  it('sets field values for each result using valueMap', async () => {
    const lfForm = getLFFormMock<FillTableLFFormMock>();
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.changeFieldSettings.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]);

    const results = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];

    const valueMap = {
      5: (entry: typeof results[0]) => entry.name,
      6: (entry: typeof results[0]) => entry.age,
    };

    await fillTableWithGenericResults({ fieldId: 1 }, results, valueMap);

    expect(lfForm.setFieldValues).toHaveBeenCalledWith(
      { fieldId: 5 },
      ['Alice', 'Bob']
    );
    expect(lfForm.setFieldValues).toHaveBeenCalledWith(
      { fieldId: 6 },
      [30, 25]
    );
  });

  it('handles mixed setValue and changeSettings in valueMap', async () => {
    const lfForm = getLFFormMock<FillTableLFFormMock>();
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.changeFieldSettings.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]);

    const results = [
      { name: 'Alice', label: 'Employee A' },
      { name: 'Bob', label: 'Employee B' },
    ];

    type Result = typeof results[0];
    const valueMap: Record<number, (entry: Result) => LFFormSetFieldValueType | { setValue?: LFFormSetFieldValueType; changeSettings?: LFFormChangeFieldSettingsType }> = {
      5: (entry) => entry.name,
      6: (entry) => ({ changeSettings: { label: entry.label } }),
    };

    await fillTableWithGenericResults({ fieldId: 1 }, results, valueMap);

    expect(lfForm.setFieldValues).toHaveBeenCalled();
    expect(lfForm.changeFieldSettings).toHaveBeenCalled();
  });

  it('updates table row count to match results length', async () => {
    const lfForm = getLFFormMock<FillTableLFFormMock>();
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]);

    const results = [{ id: 1 }, { id: 2 }, { id: 3 }];

    await fillTableWithGenericResults({ fieldId: 1 }, results, {
      5: (e) => e.id,
    });

    expect(lfForm.addRow).toHaveBeenCalledWith({ fieldId: 1 }, 3);
  });

  it('returns settled promise results', async () => {
    const lfForm = getLFFormMock<FillTableLFFormMock>();
    lfForm.setFieldValues.mockResolvedValue({ success: true });
    lfForm.getFieldValues.mockReturnValue([]); // Mock returns empty array

    const results = [{ id: 1 }, { id: 2 }];

    const promiseResults = await fillTableWithGenericResults(
      { fieldId: 1 },
      results,
      { 5: (e) => e.id }
    );

    expect(promiseResults).toBeDefined();
    // Since all mocked functions resolve successfully, all should be fulfilled
    expect(promiseResults?.every(r => r.status === 'fulfilled')).toBe(true);
  });
});
