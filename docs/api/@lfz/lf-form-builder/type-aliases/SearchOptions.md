[Documentation](../../../index.md) / [@lf/lf-form-builder](../index.md) / [](../README.md) / SearchOptions

# Type Alias: SearchOptions

> **SearchOptions** = `object`

Defined in: [packages/core/src/lib/api/search/search.ts:14](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L14)

## Properties

### fuzzyFactor?

> `optional` **fuzzyFactor?**: `number`

Defined in: [packages/core/src/lib/api/search/search.ts:49](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L49)

Factor to use in conjunction with `fuzzyType`

***

### fuzzyType?

> `optional` **fuzzyType?**: `FuzzyType`

Defined in: [packages/core/src/lib/api/search/search.ts:53](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L53)

Implementation of fuzzy operation on the search

***

### includeFields?

> `optional` **includeFields?**: `string`[]

Defined in: [packages/core/src/lib/api/search/search.ts:57](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L57)

The fields to include in the search results

***

### maxPageSize?

> `optional` **maxPageSize?**: `number`

Defined in: [packages/core/src/lib/api/search/search.ts:32](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L32)

The maximum number of search results to return.

#### Default

```ts
1000
```

***

### maxPollAttempts?

> `optional` **maxPollAttempts?**: `number`

Defined in: [packages/core/src/lib/api/search/search.ts:26](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L26)

Maximum number of times to poll for the search results

#### Default

```ts
20
```

***

### onPollIteration?

> `optional` **onPollIteration?**: (`task?`) => `void`

Defined in: [packages/core/src/lib/api/search/search.ts:45](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L45)

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

Defined in: [packages/core/src/lib/api/search/search.ts:38](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L38)

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

Defined in: [packages/core/src/lib/api/search/search.ts:20](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L20)

The number of milliseconds to wait when polling completed search requests.

#### Default

```ts
250
```
