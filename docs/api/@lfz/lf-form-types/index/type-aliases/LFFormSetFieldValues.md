[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormSetFieldValues

# Type Alias: LFFormSetFieldValues

> **LFFormSetFieldValues** = \<`FieldValType`, `T`\>(`id`, `value`) => `Promise`\<\{ `success`: `true`; `error?`: `never`; \} \| \{ `success`: `false`; `error`: `string`; \}\>

Defined in: [LFForm/methods.ts:73](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/methods.ts#L73)

Sets field values for one or more matching fields.

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

`Promise`\<\{ `success`: `true`; `error?`: `never`; \} \| \{ `success`: `false`; `error`: `string`; \}\>

## Remarks

**Repeatable behavior:**
- Single field: pass a scalar or object value.
- Repeatable column (all rows): pass a scalar (sets every row) or a row-ordered array.
- Specific row/set: include `index` in the id.

Read-only fields cannot be changed. Value type must match the field type.

## Example

```javascript
const formFields = {
  status: { fieldId: 40 },
  expenseAmountColumn: { fieldId: 31 },
  foodChoice: { fieldId: 50 },
  geolocation: { fieldId: 60 },
};

await LFForm.setFieldValues(formFields.status, 'Open');
await LFForm.setFieldValues(formFields.foodChoice, { value: ['Option1', 'Option2'] });
await LFForm.setFieldValues(formFields.geolocation, { latitude: 33.68, longitude: -117.82 });

// Set all rows to 0, or set each row by index-ordered array
await LFForm.setFieldValues(formFields.expenseAmountColumn, 0);
await LFForm.setFieldValues(formFields.expenseAmountColumn, [120, 80, 55]);
await LFForm.setFieldValues({ fieldId: 31, index: 0 }, 120);
```
