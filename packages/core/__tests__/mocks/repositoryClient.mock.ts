import type { RepositoryApiClient } from '@laserfiche/lf-repository-api-client-v2';

type RepositoryRecord = {
  id?: string;
  repoId?: string;
  name?: string;
};

export const createRepositoryClientMock = (
  repositories: RepositoryRecord[] = [{ id: 'repo-a', repoId: 'repo-a', name: 'Repo A' }],
): RepositoryApiClient => {
  return {
    repositoriesClient: {
      listRepositories: async () => ({ value: repositories }),
    },
  } as unknown as RepositoryApiClient;
};
