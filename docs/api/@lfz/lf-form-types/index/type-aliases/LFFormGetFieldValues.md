[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormGetFieldValues

# Type Alias: LFFormGetFieldValues

> **LFFormGetFieldValues** = \<`F`, `T`\>(`id`) => `F` *extends* [`LFFormField`](LFFormField.md) ? [`LFFormFieldValueType`](LFFormFieldValueType.md)\<`F`\> : `F` *extends* infer TT[] ? [`LFFormFieldValueType`](LFFormFieldValueType.md)\<`TT`\>[] : [`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"isMultiple"`\] *extends* `true` ? [`LFFormFieldValueType`](LFFormFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[[`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"componentType"`\]\]\>[] : [`LFFormFieldValueType`](LFFormFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[[`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"componentType"`\]\]\>

Defined in: [LFForm/getters.ts:104](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L104)

## Type Parameters

### F

`F` *extends* [`LFFormField`](LFFormField.md) \| [`LFFormField`](LFFormField.md)[] \| `unknown` = `unknown`

### T

`T` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

## Parameters

### id

`T` \| `T`[]

## Returns

`F` *extends* [`LFFormField`](LFFormField.md) ? [`LFFormFieldValueType`](LFFormFieldValueType.md)\<`F`\> : `F` *extends* infer TT[] ? [`LFFormFieldValueType`](LFFormFieldValueType.md)\<`TT`\>[] : [`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"isMultiple"`\] *extends* `true` ? [`LFFormFieldValueType`](LFFormFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[[`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"componentType"`\]\]\>[] : [`LFFormFieldValueType`](LFFormFieldValueType.md)\<[`ComponentTypes`](ComponentTypes.md)\[[`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`T`\>\[`"componentType"`\]\]\>
