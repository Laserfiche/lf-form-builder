[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFFormSetFieldValues

# Type Alias: LFFormSetFieldValues

> **LFFormSetFieldValues** = \<`FieldValType`, `T`\>(`id`, `value`) => `Promise`\<\{ `error?`: `never`; `success`: `true`; \} \| \{ `error`: `string`; `success`: `false`; \}\>

Defined in: LFForm/methods.ts:26

## Type Parameters

### FieldValType

`FieldValType` *extends* [`LFFormField`](LFFormField.md) \| [`LFFormField`](LFFormField.md)[] = [`LFFormField`](LFFormField.md)

### T

`T` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

## Parameters

### id

`T` \| `T`[]

### value

[`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"isDisabled"`\] *extends* `true` ? `never` : `T`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](ComponentTypes.md) ? [`LFFormSetFieldValueType`](LFFormSetFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[`T`\[`"componentType"`\] & keyof [`ComponentTypes`](ComponentTypes.md)\]\> \| [`LFFormSetFieldValueType`](LFFormSetFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[`T`\[`"componentType"`\] & keyof [`ComponentTypes`](ComponentTypes.md)\]\>[] : \[`FieldValType`\] *extends* \[infer ElemType[]\] ? [`LFFormSetFieldValueType`](LFFormSetFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[`LFFormExtractComponentType`\<`ElemType`\>\]\> \| [`LFFormSetFieldValueType`](LFFormSetFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[`LFFormExtractComponentType`\<`ElemType`\>\]\>[] : [`LFFormSetFieldValueType`](LFFormSetFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[`LFFormExtractComponentType`\<`FieldValType`\>\]\> \| [`LFFormSetFieldValueType`](LFFormSetFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[`LFFormExtractComponentType`\<`FieldValType`\>\]\>[]

## Returns

`Promise`\<\{ `error?`: `never`; `success`: `true`; \} \| \{ `error`: `string`; `success`: `false`; \}\>
