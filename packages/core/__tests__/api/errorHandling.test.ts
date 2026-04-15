import { describe, expect, it } from 'vitest';
import {
  resolveEntryIdField,
  resolveDefaultRepositoryAPIOptions,
} from '../../src/lib/api/repositoryApiHelpers';
import { getLFFormMock, type LFFormTestMock } from '../mocks/lfForm.mock';
import { createRepositoryClientMock } from '../mocks/repositoryClient.mock';

type ApiErrorHandlingLFFormMock = Pick<
  LFFormTestMock,
  'findFieldsByVariableName' | 'findFieldsByFieldId' | 'getFieldValues' | 'getLaserficheAPIClient'
>;

describe('API Error Handling', () => {
  describe('resolveEntryIdField - error cases', () => {
    it('returns undefined for zero', () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 1 }]);
      lfForm.getFieldValues.mockReturnValue('0');

      const result = resolveEntryIdField();

      expect(result).toBeUndefined();
    });

    it('returns undefined for non-numeric strings', () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 1 }]);
      lfForm.getFieldValues.mockReturnValue('not-a-number');

      const result = resolveEntryIdField();

      expect(result).toBeUndefined();
    });

    it('returns undefined when Entry_ID field is not found', () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      lfForm.findFieldsByVariableName.mockReturnValue([]);

      const result = resolveEntryIdField();

      expect(result).toBeUndefined();
    });
  });

  describe('resolveDefaultRepositoryAPIOptions - error cases', () => {
    it('throws error when entry ID cannot be resolved', async () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      lfForm.findFieldsByVariableName.mockReturnValue([]);
      lfForm.getLaserficheAPIClient.mockResolvedValue(
        createRepositoryClientMock([{ id: 'repo-a', repoId: 'repo-a' }])
      );

      await expect(
        resolveDefaultRepositoryAPIOptions({ repositoryId: 'repo-a' })
      ).rejects.toThrow('Entry ID is required');
    });

    it('throws error when repository ID is not provided', async () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 1 }]);
      lfForm.getFieldValues.mockReturnValue('10');
      lfForm.getLaserficheAPIClient.mockResolvedValue(
        createRepositoryClientMock([{ id: 'repo-a', repoId: 'repo-a' }])
      );

      await expect(
        resolveDefaultRepositoryAPIOptions({})
      ).rejects.toThrow('Repository ID is required');
    });

    it('throws error when entry ID field is provided but returns invalid data', async () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      lfForm.findFieldsByFieldId.mockReturnValue([{ fieldId: 5 }]);
      lfForm.getFieldValues.mockReturnValue('invalid');
      lfForm.getLaserficheAPIClient.mockResolvedValue(
        createRepositoryClientMock([{ id: 'repo-a', repoId: 'repo-a' }])
      );

      await expect(
        resolveDefaultRepositoryAPIOptions({
          entryIdField: { fieldId: 5 },
          repositoryId: 'repo-a',
        })
      ).rejects.toThrow('Entry ID is required');
    });

    it('succeeds with valid data', async () => {
      const lfForm = getLFFormMock<ApiErrorHandlingLFFormMock>();
      const mockClient = createRepositoryClientMock([
        { id: 'repo-a', repoId: 'repo-a', name: 'Repository A' },
      ]);
      lfForm.findFieldsByVariableName.mockReturnValue([{ fieldId: 1 }]);
      lfForm.getFieldValues.mockReturnValue('42');
      lfForm.getLaserficheAPIClient.mockResolvedValue(mockClient);

      const result = await resolveDefaultRepositoryAPIOptions({
        repositoryId: 'repo-a',
      });

      expect(result).toMatchObject({
        entryId: 42,
        repositoryId: 'repo-a',
        apiClient: mockClient,
      });
    });
  });
});
