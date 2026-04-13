[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / SearchOptions

# Type Alias: SearchOptions

> **SearchOptions** = `object`

Defined in: packages/core/src/lib/api/search/search.ts:14

## Properties

### fuzzyFactor?

> `optional` **fuzzyFactor?**: `number`

Defined in: packages/core/src/lib/api/search/search.ts:49

Factor to use in conjunction with `fuzzyType`

***

### fuzzyType?

> `optional` **fuzzyType?**: `FuzzyType`

Defined in: packages/core/src/lib/api/search/search.ts:53

Implementation of fuzzy operation on the search

***

### includeFields?

> `optional` **includeFields?**: `string`[]

Defined in: packages/core/src/lib/api/search/search.ts:57

The fields to include in the search results

***

### maxPageSize?

> `optional` **maxPageSize?**: `number`

Defined in: packages/core/src/lib/api/search/search.ts:32

The maximum number of search results to return.

#### Default

```ts
1000
```

***

### maxPollAttempts?

> `optional` **maxPollAttempts?**: `number`

Defined in: packages/core/src/lib/api/search/search.ts:26

Maximum number of times to poll for the search results

#### Default

```ts
20
```

***

### onPollIteration?

> `optional` **onPollIteration?**: (`task?`) => `void`

Defined in: packages/core/src/lib/api/search/search.ts:45

Callback method to invoke on each iteration of polling the search task api

#### Parameters

##### task?

`TaskProgress`

Progress iteration object from the search api. Useful for progress bars, etc.

#### Returns

`void`

***

### onSearchStart?

> `optional` **onSearchStart?**: (`startTask?`) => `void`

Defined in: packages/core/src/lib/api/search/search.ts:38

Callback method to invoke as soon as the search is created

#### Parameters

##### startTask?

`StartTaskResponse`

Start task response from the search api

#### Returns

`void`

***

### pollInterval?

> `optional` **pollInterval?**: `number`

Defined in: packages/core/src/lib/api/search/search.ts:20

The number of milliseconds to wait when polling completed search requests.

#### Default

```ts
250
```
