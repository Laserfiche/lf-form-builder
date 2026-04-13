[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / fillTableWithGenericResults

# Function: fillTableWithGenericResults()

> **fillTableWithGenericResults**\<`T`\>(`tableFieldId`, `results`, `valueMap`): `Promise`\<`PromiseSettledResult`\<`LFFormPromiseResponse`\>[] \| `undefined`\>

Defined in: packages/core/src/lib/utils/tables/fillTableWithResults.ts:27

Fills a table with search results.

## Type Parameters

### T

`T`

## Parameters

### tableFieldId

[`LFFormId`](../../lf-form-types/LFForm/type-aliases/LFFormId.md)

The ID of the table field.

### results

`T`[]

The search results.

### valueMap

A mapping of field IDs to functions that transform an entry into a field value.

## Returns

`Promise`\<`PromiseSettledResult`\<`LFFormPromiseResponse`\>[] \| `undefined`\>

A promise that resolves to an array of settled promises, or undefined if there are no results.
