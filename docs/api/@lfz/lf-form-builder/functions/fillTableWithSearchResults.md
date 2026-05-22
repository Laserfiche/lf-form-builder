[Documentation](../../../index.md) / [@lf/lf-form-builder](../index.md) / [](../README.md) / fillTableWithSearchResults

# Function: fillTableWithSearchResults()

> **fillTableWithSearchResults**(`tableFieldId`, `results`, `valueMap`): `Promise`\<`PromiseSettledResult`\<[`LFFormPromiseResponse`](../../lf-form-types/index/type-aliases/LFFormPromiseResponse.md)\>[] \| `undefined`\>

Defined in: [packages/core/src/lib/api/search/search.ts:177](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/api/search/search.ts#L177)

Fills a table with search results.

## Parameters

### tableFieldId

[`LFFormId`](../../lf-form-types/index/type-aliases/LFFormId.md)

The ID of the table field.

### results

`EntryCollectionResponse`

The search results.

### valueMap

A mapping of field IDs to functions that transform an entry into a field value.

## Returns

`Promise`\<`PromiseSettledResult`\<[`LFFormPromiseResponse`](../../lf-form-types/index/type-aliases/LFFormPromiseResponse.md)\>[] \| `undefined`\>

A promise that resolves to an array of settled promises, or undefined if there are no results.
