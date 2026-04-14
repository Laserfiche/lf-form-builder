[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / setTableFieldValues

# Function: setTableFieldValues()

> **setTableFieldValues**(`tableFieldId`, `values`, `options`): `Promise`\<`PromiseSettledResult`\<\{ `error?`: `undefined`; `success`: `true`; \} \| \{ `error`: `string`; `success`: `false`; \}\>[]\>

Defined in: [packages/core/src/lib/utils/tables/setFieldValues.ts:21](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/lib/utils/tables/setFieldValues.ts#L21)

## Parameters

### tableFieldId

[`LFFormId`](../../lf-form-types/index/type-aliases/LFFormId.md)

table field to set values on

### values

(`string` \| `number` \| [`DateTimeFieldValue`](../../lf-form-types/index/type-aliases/DateTimeFieldValue.md) \| [`GeolocationFieldValue`](../../lf-form-types/index/type-aliases/GeolocationFieldValue.md) \| [`AddressFieldValue`](../../lf-form-types/index/type-aliases/AddressFieldValue.md) \| [`MultiOptionFieldValue`](../../lf-form-types/index/type-aliases/MultiOptionFieldValue.md) \| [`SingleOptionFieldValue`](../../lf-form-types/index/type-aliases/SingleOptionFieldValue.md))[][]

values to set on the table, order of values dictated by options.valueOrder

### options

[`SetFieldValueOptions`](../type-aliases/SetFieldValueOptions.md)

replaceMode to replace or append values, valueOrder to set values by row or column

## Returns

`Promise`\<`PromiseSettledResult`\<\{ `error?`: `undefined`; `success`: `true`; \} \| \{ `error`: `string`; `success`: `false`; \}\>[]\>

a promise showing the result of the setFieldValues operation

## Preserve

docs
