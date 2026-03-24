import type {
  FuzzyType,
  SearchEntryRequest,
  RepositoryApiClient,
  TaskResult,
  TaskProgress,
  StartTaskResponse,
  EntryCollectionResponse,
  IEntry,
} from '@laserfiche/lf-repository-api-client-v2';
import type { LFFormId, LFFormPromiseResponse } from '@lfz/lf-form-types';
import { fillTableWithGenericResults } from '@/lib/utils/tables/fillTableWithResults';

export type SearchOptions = {
  /**
   * The number of milliseconds to wait when polling completed search requests.
   *
   * @default 250
   */
  pollInterval?: number;
  /**
   * Maximum number of times to poll for the search results
   *
   * @default 20
   */
  maxPollAttempts?: number;
  /**
   * The maximum number of search results to return.
   *
   * @default 1000
   */
  maxPageSize?: number;
  /**
   * Callback method to invoke as soon as the search is created
   *
   * @param startTask Start task response from the search api
   */
  onSearchStart?: (startTask?: StartTaskResponse) => void;
  /**
   * Callback method to invoke on each iteration of polling the search task api
   *
   * @param task Progress iteration object from the search api. Useful for progress bars, etc.
   * @returns
   */
  onPollIteration?: (task?: TaskProgress) => void;
  /**
   * Factor to use in conjunction with `fuzzyType`
   */
  fuzzyFactor?: number;
  /**
   * Implementation of fuzzy operation on the search
   */
  fuzzyType?: FuzzyType;
  /**
   * The fields to include in the search results
   */
  includeFields?: string[];
};
/**
 * Default search options used in conjunction with options passed to {@link searchAsync}
 */
export const defaultSearchOptions = {
  pollInterval: 250,
  maxPollAttempts: 20,
  maxPageSize: 1000,
  includeFields: [],
} as const;
/**
 * @param {RepositoryApiClient} apiClient The repository api client
 * @param {string} repositoryId The id of the repository to search
 * @param {string} searchCommand The search command to run
 * @param {SearchOptions} searchOptions Optional search options
 * @returns {Promise<EntryCollectionResponse | null>} The search results or null if the search was canceled
 * @preserve docs
 */
export const searchAsync = async (
  apiClient: RepositoryApiClient,
  repositoryId: string,
  searchCommand: string,
  searchOptions?: SearchOptions,
): Promise<EntryCollectionResponse | null> => {
  const { pollInterval, fuzzyFactor, fuzzyType, maxPageSize, maxPollAttempts } =
    {
      ...defaultSearchOptions,
      ...searchOptions,
    };
  const openTasks = await apiClient.tasksClient.listTasks({ repositoryId });
  const openTaskIds = openTasks.value?.map((task) => task.id) ?? [];
  if (openTaskIds?.length && openTaskIds.length > 1) {
    console.warn('Cancelling previous search task');
    await apiClient.tasksClient
      .cancelTasks({
        repositoryId,
        taskIds: openTaskIds
          .filter((t): t is string => t !== undefined)
          .slice(1),
      })
      .catch();
  }
  const startTask = await apiClient.searchesClient.startSearchEntry({
    repositoryId,
    request: {
      searchCommand,
      fuzzyFactor,
      fuzzyType,
    } as unknown as SearchEntryRequest,
  });
  const { taskId } = startTask;
  if (taskId === undefined) return null;

  searchOptions?.onSearchStart?.(startTask);

  const finalTaskResponse = await new Promise<TaskResult | undefined>(
    (resolve, reject) => {
      let awaitingInterval = false;
      let currentPollCount = 0;
      const timeout = setInterval(async () => {
        console.log(currentPollCount);
        if (awaitingInterval) return;
        if (currentPollCount >= maxPollAttempts) {
          clearInterval(timeout);
          reject('Search timed out');
          return;
        }
        currentPollCount++;
        awaitingInterval = true;
        const taskResponse = await apiClient.tasksClient.listTasks({
          repositoryId,
          taskIds: [taskId],
        });
        searchOptions?.onPollIteration?.(taskResponse.value?.[0]);
        if (taskResponse?.value?.[0].status === 'Completed') {
          clearInterval(timeout);
          resolve(taskResponse.value[0].result);
          return;
        }
        if (taskResponse?.value?.[0].status === 'Failed') {
          clearInterval(timeout);
          reject(
            new Error(
              taskResponse.value[0].errors?.[0]?.title ??
                'Unknown search error',
            ),
          );
          return;
        }
        if (taskResponse?.value?.[0].status === 'Cancelled') {
          clearInterval(timeout);
          resolve(undefined);
          return;
        }
      }, pollInterval);
    },
  );
  if (!finalTaskResponse) {
    return null;
  }
  const searchResponse = await apiClient.searchesClient.listSearchResults({
    repositoryId,
    taskId,
    prefer: `odata.maxpagesize=${maxPageSize}`,
    fields: searchOptions?.includeFields
      ? searchOptions.includeFields
      : undefined,
  });
  return searchResponse;
};

/**
 * Fills a table with search results.
 *
 * @param tableFieldId - The ID of the table field.
 * @param results - The search results.
 * @param valueMap - A mapping of field IDs to functions that transform an entry into a field value.
 * @returns A promise that resolves to an array of settled promises, or undefined if there are no results.
 */
export const fillTableWithSearchResults = async (
  tableFieldId: LFFormId,
  results: EntryCollectionResponse,
  valueMap: Parameters<typeof fillTableWithGenericResults<IEntry>>['2'],
): Promise<PromiseSettledResult<LFFormPromiseResponse>[] | undefined> => {
  if (!results.value?.length) return;
  return fillTableWithGenericResults(tableFieldId, results.value, valueMap);
};
