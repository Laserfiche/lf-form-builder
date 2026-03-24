import {
  Repository,
  RepositoryApiClient,
} from '@laserfiche/lf-repository-api-client-v2';

/**
 * Returns a list of repositories. Errors if no repositories are found.
 * @param {RepositoryApiClient} apiClient 
 * @returns {Promise<Repository[]>}
 * @preserve docs
 */
export const getRepositories = async (apiClient?: RepositoryApiClient): Promise<Repository[]> => {
  const resolvedApiClient =
    apiClient ??
    (await LFForm.getLaserficheAPIClient<RepositoryApiClient>('Default'));
  const repositories =
    await resolvedApiClient.repositoriesClient.listRepositories({});
  if (!repositories.value || repositories.value.length === 0) {
    throw new Error('No repositories found');
  }
  return repositories.value;
};
