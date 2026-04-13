[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / searchAsync

# Function: searchAsync()

> **searchAsync**(`apiClient`, `repositoryId`, `searchCommand`, `searchOptions?`): `Promise`\<`EntryCollectionResponse` \| `null`\>

Defined in: packages/core/src/lib/api/search/search.ts:76

## Parameters

### apiClient

`RepositoryApiClient`

The repository api client

### repositoryId

`string`

The id of the repository to search

### searchCommand

`string`

The search command to run

### searchOptions?

[`SearchOptions`](../type-aliases/SearchOptions.md)

Optional search options

## Returns

`Promise`\<`EntryCollectionResponse` \| `null`\>

The search results or null if the search was canceled

## Preserve

docs
