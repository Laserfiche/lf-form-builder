[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormFindFieldsBy

# Type Alias: LFFormFindFieldsBy\<Param, FieldType\>

> **LFFormFindFieldsBy**\<`Param`, `FieldType`\> = \<`FindFieldType`\>(`findBy`) => `FindFieldType` *extends* `TT` \| `TT`[] ? `TT`[] : [`ComponentTypes`](ComponentTypes.md)\[`FieldType`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](ComponentTypes.md) ? `any`\[`any`\] : keyof [`ComponentTypes`](ComponentTypes.md)\] *extends* [`LFFormField`](LFFormField.md) \| [`LFFormField`](LFFormField.md)[] ? `any`\[`any`\][] : [`LFFormField`](LFFormField.md)[]

Defined in: LFForm/getters.ts:122

## Type Parameters

### Param

`Param`

### FieldType

`FieldType` *extends* [`LFFormField`](LFFormField.md) \| [`LFFormField`](LFFormField.md)[] \| [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormField`](LFFormField.md)

## Type Parameters

### FindFieldType

`FindFieldType` *extends* [`LFFormField`](LFFormField.md) \| [`LFFormFieldRef`](LFFormFieldRef.md) \| [`LFFormField`](LFFormField.md)[] \| `FieldType`[]

## Parameters

### findBy

`Param`

## Returns

`FindFieldType` *extends* `TT` \| `TT`[] ? `TT`[] : [`ComponentTypes`](ComponentTypes.md)\[`FieldType`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](ComponentTypes.md) ? `any`\[`any`\] : keyof [`ComponentTypes`](ComponentTypes.md)\] *extends* [`LFFormField`](LFFormField.md) \| [`LFFormField`](LFFormField.md)[] ? `any`\[`any`\][] : [`LFFormField`](LFFormField.md)[]
