import type { RepositoryApiClient } from '@laserfiche/lf-repository-api-client-v2';
import { findFieldByIdParam, findFieldOrNull } from '@/lib/findFieldByLFFormId';
import type { LFFormId, LFFormField, TextField } from '@lfz/lf-form-types';
import { getRepositories } from './repository';
/**
 * Required helper function for all api operations. Do not modify.
 * @param {string | number | LFFormId | LFFormField} entryIdField
 * @returns {number | undefined}
 * @preserve docs
 */
export const resolveEntryIdField = (
  entryIdField?: DefaultRepositoryAPIOptions['entryIdField'],
): number | undefined => {
  let resolvedEntryId: string | number | undefined = undefined;
  if (typeof entryIdField === 'string' || typeof entryIdField === 'number') {
    resolvedEntryId = entryIdField;
  } else if (entryIdField) {
    resolvedEntryId = LFForm.getFieldValues<TextField>(
      findFieldByIdParam(entryIdField)[0],
    );
  } else {
    const resolvedField =
      findFieldOrNull({ variableName: 'Entry_ID' }) ??
      findFieldOrNull({ variableName: 'EntryId' });
    if (resolvedField) {
      resolvedEntryId = LFForm.getFieldValues<TextField>(resolvedField[0]);
    }
  }
  const entryId = Number(resolvedEntryId);
  if (isNaN(entryId) || entryId === 0) {
    return;
  }
  return entryId;
};

/**
 * Represents the options for the DefaultRepositoryAPI.
 *
 * @template Options - The type of additional options that are be provided by the caller function
 */
export type DefaultRepositoryAPIOptions<Options extends Record<string, unknown> = never> = {
  /**
   * Entry ID field or value to pass along to caller api functions
   */
  entryIdField?: LFFormField | LFFormId | string | number;
  /**
   * Repository ID value to pass along to caller api functions. Will default to the first repository if only one repository exists
   */
  repositoryId?: string;
  /**
   * API Client to pass along to caller api functions. Will default to the 'Default' client if none is passed
   */
  apiClient?: RepositoryApiClient;
  /**
   * The type of additional options that are be provided by the caller function
   */
  options: Options;
};
/**
 * Required helper function for all api operations. Do not modify.
 * @param options
 * @returns {{apiClient: RepositoryApiClient, repositoryId: string, entryId: number}}
 * @preserve docs
 */
export const resolveDefaultRepositoryAPIOptions = async (
  options: Omit<DefaultRepositoryAPIOptions, 'options'>,
): Promise<
  Required<Omit<DefaultRepositoryAPIOptions, 'entryIdField' | 'options'>> & {
    entryId: number;
  }
> => {
  const apiClient =
    options.apiClient ??
    (await LFForm.getLaserficheAPIClient<RepositoryApiClient>('Default'));
  const repositoryId = options.repositoryId || (await getRepositories());
  if (Array.isArray(repositoryId)) {
    throw new Error('Repository ID is required');
  }
  const entryId = resolveEntryIdField(options.entryIdField);
  if (!entryId) {
    throw new Error('Entry ID is required');
  }
  return {
    entryId,
    repositoryId,
    apiClient,
  };
};
