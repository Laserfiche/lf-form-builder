import { describe, expect, it } from 'vitest';
import {
  findField,
  findFieldByIdParam,
  findFieldOrNull,
} from '../src/lib/findFieldByLFFormId';
import { getLFFormMock, type LFFormTestMock } from './mocks/lfForm.mock';

type FindFieldLFFormMock = Pick<
  LFFormTestMock,
  'findFieldsByFieldId' | 'findFieldsByVariableId' | 'findFieldsByVariableName'
>;

describe('findField', () => {
  it('finds field by fieldId via LFForm', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { fieldId: 10, name: 'Test Field' };
    lfForm.findFieldsByFieldId.mockReturnValue([mockField]);

    const result = findField({ fieldId: 10 });

    expect(result).toEqual([mockField]);
    expect(lfForm.findFieldsByFieldId).toHaveBeenCalledWith(10);
  });

  it('finds field by variableId', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { variableId: 'var123', name: 'Var Field' };
    lfForm.findFieldsByVariableId.mockReturnValue([mockField]);

    const result = findField({ variableId: 'var123' });

    expect(result).toEqual([mockField]);
    expect(lfForm.findFieldsByVariableId).toHaveBeenCalledWith('var123');
  });

  it('finds field by variableName', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { variableName: 'userEmail', name: 'Email Field' };
    lfForm.findFieldsByVariableName.mockReturnValue([mockField]);

    const result = findField({ variableName: 'userEmail' });

    expect(result).toEqual([mockField]);
    expect(lfForm.findFieldsByVariableName).toHaveBeenCalledWith('userEmail');
  });

  it('throws error when no valid identifier is provided', () => {
    getLFFormMock<FindFieldLFFormMock>();

    expect(() => findField({})).toThrow(
      'Field must have a fieldId, variableId, or variableName'
    );
  });

  it('returns empty array when field is not found', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([]);

    const result = findField({ fieldId: 999 });

    expect(result).toEqual([]);
  });

  it('prefers fieldId over other identifiers', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { fieldId: 10 };
    lfForm.findFieldsByFieldId.mockReturnValue([mockField]);

    // Pass multiple identifiers — should prioritize fieldId
    const result = findField({
      fieldId: 10,
      variableId: 'var123',
      variableName: 'test',
    });

    expect(result).toEqual([mockField]);
    expect(lfForm.findFieldsByFieldId).toHaveBeenCalledWith(10);
    expect(lfForm.findFieldsByVariableId).not.toHaveBeenCalled();
  });
});

describe('findFieldByIdParam', () => {
  it('returns empty array when fieldId is null', () => {
    getLFFormMock<FindFieldLFFormMock>();

    const result = findFieldByIdParam(null as unknown as Parameters<typeof findFieldByIdParam>[0]);

    expect(result).toEqual([]);
  });

  it('returns empty array when fieldId is undefined', () => {
    getLFFormMock<FindFieldLFFormMock>();

    const result = findFieldByIdParam(undefined as unknown as Parameters<typeof findFieldByIdParam>[0]);

    expect(result).toEqual([]);
  });

  it('finds single field when passed a single LFFormId', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { fieldId: 5 };
    lfForm.findFieldsByFieldId.mockReturnValue([mockField]);

    const result = findFieldByIdParam({ fieldId: 5 });

    expect(result).toEqual([mockField]);
  });

  it('finds multiple fields when passed array of LFFormIds', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField1 = { fieldId: 1 };
    const mockField2 = { fieldId: 2 };
    lfForm.findFieldsByFieldId
      .mockReturnValueOnce([mockField1])
      .mockReturnValueOnce([mockField2]);

    const result = findFieldByIdParam([{ fieldId: 1 }, { fieldId: 2 }]);

    expect(result).toEqual([mockField1, mockField2]);
  });

  it('flattens results from multiple field lookups', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockFields = [{ fieldId: 1 }, { fieldId: 1 }]; // Same field returned twice
    lfForm.findFieldsByFieldId.mockReturnValue(mockFields);

    const result = findFieldByIdParam([{ fieldId: 1 }]);

    expect(result).toEqual(mockFields);
  });
});

describe('findFieldOrNull', () => {
  it('returns null when field is not found', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([]);

    const result = findFieldOrNull({ fieldId: 999 });

    expect(result).toBeNull();
  });

  it('returns field array when field is found', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { fieldId: 10 };
    lfForm.findFieldsByFieldId.mockReturnValue([mockField]);

    const result = findFieldOrNull({ fieldId: 10 });

    expect(result).toEqual([mockField]);
  });

  it('returns array even with single field', () => {
    const lfForm = getLFFormMock<FindFieldLFFormMock>();
    const mockField = { fieldId: 10 };
    lfForm.findFieldsByFieldId.mockReturnValue([mockField]);

    const result = findFieldOrNull({ fieldId: 10 });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });
});
