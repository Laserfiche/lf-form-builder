import { describe, expect, it } from 'vitest';
import {
  resolveDefaultRepositoryAPIOptions,
  resolveEntryIdField,
} from '../../../src/lib/api/repositoryApiHelpers';
import { getLFFormMock, type LFFormTestMock } from '../../mocks/lfForm.mock';
import { createRepositoryClientMock } from '../../mocks/repositoryClient.mock';

type RepositoryApiHelpersLFFormMock = Pick<
  LFFormTestMock,
  | 'findFieldsByFieldId'
  | 'findFieldsByVariableName'
  | 'getFieldValues'
  | 'getLaserficheAPIClient'
>;

describe('resolveEntryIdField', () => {
  it('returns numeric value when entryIdField is a direct number', () => {
    expect(resolveEntryIdField(42)).toBe(42);
  });

  it('resolves entry id from a field id through LFForm', () => {
    const lfForm = getLFFormMock<RepositoryApiHelpersLFFormMock>();
    lfForm.findFieldsByFieldId.mockReturnValue([{ fieldId: 10 }]);
    lfForm.getFieldValues.mockReturnValue('123');

    const result = resolveEntryIdField({ fieldId: 10 });

    expect(result).toBe(123);
    expect(lfForm.findFieldsByFieldId).toHaveBeenCalledWith(10);
    expect(lfForm.getFieldValues).toHaveBeenCalledWith({ fieldId: 10 });
  });

  it('falls back to Entry_ID variable lookup when no input is provided', () => {
    const lfForm = getLFFormMock<RepositoryApiHelpersLFFormMock>();
    lfForm.findFieldsByVariableName.mockImplementation((name: string) => {
      if (name === 'Entry_ID') {
        return [{ variableName: 'Entry_ID', fieldId: 77 }];
      }
      return [];
    });
    lfForm.getFieldValues.mockReturnValue('901');

    const result = resolveEntryIdField();

    expect(result).toBe(901);
    expect(lfForm.findFieldsByVariableName).toHaveBeenCalledWith('Entry_ID');
  });

  it('returns undefined when value is not a valid positive number', () => {
    const lfForm = getLFFormMock<RepositoryApiHelpersLFFormMock>();
    lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 4 }]);
    lfForm.getFieldValues.mockReturnValue('0');

    expect(resolveEntryIdField()).toBeUndefined();
  });
});

describe('resolveDefaultRepositoryAPIOptions', () => {
  it('resolves defaults from LFForm client and entry id field', async () => {
    const lfForm = getLFFormMock<RepositoryApiHelpersLFFormMock>();
    const mockClient = createRepositoryClientMock([
      { id: 'repo-a', repoId: 'repo-a', name: 'Repo A' },
    ]);

    lfForm.getLaserficheAPIClient.mockResolvedValue(mockClient);
    lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 16 }]);
    lfForm.getFieldValues.mockReturnValue('33');

    const result = await resolveDefaultRepositoryAPIOptions({
      repositoryId: 'repo-a',
    });

    expect(result.entryId).toBe(33);
    expect(result.repositoryId).toBe('repo-a');
    expect(result.apiClient).toBe(mockClient);
  });

  it('throws when entry id cannot be resolved', async () => {
    const lfForm = getLFFormMock<RepositoryApiHelpersLFFormMock>();
    lfForm.getLaserficheAPIClient.mockResolvedValue(
      createRepositoryClientMock([{ id: 'repo-a', repoId: 'repo-a' }]),
    );
    lfForm.findFieldsByVariableName.mockReturnValue([]);

    await expect(
      resolveDefaultRepositoryAPIOptions({ repositoryId: 'repo-a' }),
    ).rejects.toThrow(
      'Entry ID is required',
    );
  });

  it('throws when repository id is not provided', async () => {
    const lfForm = getLFFormMock<RepositoryApiHelpersLFFormMock>();
    lfForm.getLaserficheAPIClient.mockResolvedValue(
      createRepositoryClientMock([{ id: 'repo-a', repoId: 'repo-a' }]),
    );
    lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 1 }]);
    lfForm.getFieldValues.mockReturnValue('10');

    await expect(resolveDefaultRepositoryAPIOptions({})).rejects.toThrow(
      'Repository ID is required',
    );
  });
});
