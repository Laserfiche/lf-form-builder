[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / mapEntryToForm

# Function: mapEntryToForm()

> **mapEntryToForm**(`param`): `Promise`\<\{ `entryInfo`: `IEntry`; `setFields`: `PromiseSettledResult`\<[`LFFormField`](../../lf-form-types/index/type-aliases/LFFormField.md) \| `null`\>[]; \}\>

Defined in: packages/core/src/lib/api/template/mapEntryToForm.ts:104

Maps an entry's metadata to a form by matching fields based on the field's label or a custom field id.
Optionally disables fields after mapping.

## Parameters

### param

[`MapEntryToFormOptions`](../type-aliases/MapEntryToFormOptions.md)

## Returns

`Promise`\<\{ `entryInfo`: `IEntry`; `setFields`: `PromiseSettledResult`\<[`LFFormField`](../../lf-form-types/index/type-aliases/LFFormField.md) \| `null`\>[]; \}\>

## Preserve

docs
