[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / fillTableWithGenericResults

# Function: fillTableWithGenericResults()

> **fillTableWithGenericResults**\<`T`\>(`tableFieldId`, `results`, `valueMap`): `Promise`\<`PromiseSettledResult`\<[`LFFormPromiseResponse`](../../lf-form-types/index/type-aliases/LFFormPromiseResponse.md)\>[] \| `undefined`\>

Defined in: [packages/core/src/lib/utils/tables/fillTableWithResults.ts:27](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/utils/tables/fillTableWithResults.ts#L27)

Fills a table with search results.

## Type Parameters

### T

`T`

## Parameters

### tableFieldId

[`LFFormId`](../../lf-form-types/index/type-aliases/LFFormId.md)

The ID of the table field.

### results

`T`[]

The search results.

### valueMap

A mapping of field IDs to functions that transform an entry into a field value.

## Returns

`Promise`\<`PromiseSettledResult`\<[`LFFormPromiseResponse`](../../lf-form-types/index/type-aliases/LFFormPromiseResponse.md)\>[] \| `undefined`\>

A promise that resolves to an array of settled promises, or undefined if there are no results.
