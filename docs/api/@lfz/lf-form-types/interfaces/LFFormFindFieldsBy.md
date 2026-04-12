[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFFormFindFieldsBy

# Interface: LFFormFindFieldsBy()\<Param, FieldType\>

Defined in: LFForm/getters.ts:65

## Type Parameters

### Param

`Param`

### FieldType

`FieldType` *extends* [`LFFormField`](../type-aliases/LFFormField.md) \| [`LFFormField`](../type-aliases/LFFormField.md)[] \| [`LFFormFieldRef`](../type-aliases/LFFormFieldRef.md) = [`LFFormField`](../type-aliases/LFFormField.md)

> **LFFormFindFieldsBy**\<`FindFieldType`\>(`findBy`): `FindFieldType` *extends* `TT` \| `TT`[] ? `TT`[] : [`ComponentTypes`](../type-aliases/ComponentTypes.md)\[`FieldType`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](../type-aliases/ComponentTypes.md) ? `any`\[`any`\] : keyof [`ComponentTypes`](../type-aliases/ComponentTypes.md)\] *extends* [`LFFormField`](../type-aliases/LFFormField.md) \| [`LFFormField`](../type-aliases/LFFormField.md)[] ? `any`\[`any`\][] : [`LFFormField`](../type-aliases/LFFormField.md)[]

Defined in: LFForm/getters.ts:69

## Type Parameters

### FindFieldType

`FindFieldType` *extends* [`LFFormField`](../type-aliases/LFFormField.md) \| [`LFFormFieldRef`](../type-aliases/LFFormFieldRef.md) \| [`LFFormField`](../type-aliases/LFFormField.md)[] \| `FieldType`[]

## Parameters

### findBy

`Param`

## Returns

`FindFieldType` *extends* `TT` \| `TT`[] ? `TT`[] : [`ComponentTypes`](../type-aliases/ComponentTypes.md)\[`FieldType`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](../type-aliases/ComponentTypes.md) ? `any`\[`any`\] : keyof [`ComponentTypes`](../type-aliases/ComponentTypes.md)\] *extends* [`LFFormField`](../type-aliases/LFFormField.md) \| [`LFFormField`](../type-aliases/LFFormField.md)[] ? `any`\[`any`\][] : [`LFFormField`](../type-aliases/LFFormField.md)[]
