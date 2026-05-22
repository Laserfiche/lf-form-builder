[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormGetterApi

# Type Alias: LFFormGetterApi\<FieldType\>

> **LFFormGetterApi**\<`FieldType`\> = `object`

Defined in: [LFForm/getters.ts:152](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L152)

Getter APIs for reading field values and querying fields.

## Example

```javascript
const required = LFForm.findFields((f) => Boolean(f.settings?.required));
const idMatches = LFForm.findFieldsByFieldId(10);
const classMatches = LFForm.findFieldsByClassName('blue');
```

## Type Parameters

### FieldType

`FieldType` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

## Properties

### getFieldValues

> **getFieldValues**: [`LFFormGetFieldValues`](LFFormGetFieldValues.md)

Defined in: [LFForm/getters.ts:154](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L154)

Gets field values for one or more matching fields.

***

### findFields

> **findFields**: [`LFFormFindFieldsBy`](LFFormFindFieldsBy.md)\<(`field`) => `boolean`, `FieldType`\>

Defined in: [LFForm/getters.ts:156](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L156)

Finds fields matching an arbitrary predicate function.

***

### findFieldsByClassName

> **findFieldsByClassName**: [`LFFormFindFieldsBy`](LFFormFindFieldsBy.md)\<`string`, `FieldType`\>

Defined in: [LFForm/getters.ts:158](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L158)

Finds fields by CSS class name.

***

### findFieldsByFieldId

> **findFieldsByFieldId**: [`LFFormFindFieldsBy`](LFFormFindFieldsBy.md)\<`number`, `FieldType`\>

Defined in: [LFForm/getters.ts:160](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L160)

Finds fields by numeric `fieldId`.

***

### findFieldsByVariableId

> **findFieldsByVariableId**: [`LFFormFindFieldsBy`](LFFormFindFieldsBy.md)\<`string`, `FieldType`\>

Defined in: [LFForm/getters.ts:162](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L162)

Finds fields by `variableId` (GUID string).

***

### findFieldsByVariableName

> **findFieldsByVariableName**: [`LFFormFindFieldsBy`](LFFormFindFieldsBy.md)\<`string`, `FieldType`\>

Defined in: [LFForm/getters.ts:164](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L164)

Finds fields by `variableName` string.
