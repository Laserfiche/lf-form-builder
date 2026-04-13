[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / setTableFieldValues

# Function: setTableFieldValues()

> **setTableFieldValues**(`tableFieldId`, `values`, `options`): `Promise`\<`PromiseSettledResult`\<\{ `error?`: `undefined`; `success`: `true`; \} \| \{ `error`: `string`; `success`: `false`; \}\>[]\>

Defined in: packages/core/src/lib/utils/tables/setFieldValues.ts:21

## Parameters

### tableFieldId

[`LFFormId`](../../lf-form-types/type-aliases/LFFormId.md)

table field to set values on

### values

(`string` \| `number` \| [`DateTimeFieldValue`](../../lf-form-types/type-aliases/DateTimeFieldValue.md) \| [`GeolocationFieldValue`](../../lf-form-types/type-aliases/GeolocationFieldValue.md) \| [`AddressFieldValue`](../../lf-form-types/type-aliases/AddressFieldValue.md) \| [`MultiOptionFieldValue`](../../lf-form-types/type-aliases/MultiOptionFieldValue.md) \| [`SingleOptionFieldValue`](../../lf-form-types/type-aliases/SingleOptionFieldValue.md))[][]

values to set on the table, order of values dictated by options.valueOrder

### options

[`SetFieldValueOptions`](../type-aliases/SetFieldValueOptions.md)

replaceMode to replace or append values, valueOrder to set values by row or column

## Returns

`Promise`\<`PromiseSettledResult`\<\{ `error?`: `undefined`; `success`: `true`; \} \| \{ `error`: `string`; `success`: `false`; \}\>[]\>

a promise showing the result of the setFieldValues operation

## Preserve

docs
