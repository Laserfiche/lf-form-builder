[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / fillTableWithSearchResults

# Function: fillTableWithSearchResults()

> **fillTableWithSearchResults**(`tableFieldId`, `results`, `valueMap`): `Promise`\<`PromiseSettledResult`\<`LFFormPromiseResponse`\>[] \| `undefined`\>

Defined in: packages/core/src/lib/api/search/search.ts:177

Fills a table with search results.

## Parameters

### tableFieldId

[`LFFormId`](../../lf-form-types/LFForm/type-aliases/LFFormId.md)

The ID of the table field.

### results

`EntryCollectionResponse`

The search results.

### valueMap

A mapping of field IDs to functions that transform an entry into a field value.

## Returns

`Promise`\<`PromiseSettledResult`\<`LFFormPromiseResponse`\>[] \| `undefined`\>

A promise that resolves to an array of settled promises, or undefined if there are no results.
