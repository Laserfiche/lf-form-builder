[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormId

# Type Alias: LFFormId

> **LFFormId** = `object`

Defined in: [LFForm/getters.ts:28](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L28)

Identification object that tells LFForm which field(s) to target.

## Remarks

- Prefer `fieldId` for reliability, especially with repeatable (table/collection) fields.
- `variableName` is convenient for non-repeatable fields but should not be used for table/collection columns.
- `index` starts at `0` and targets a specific row/set instance.
- For template-aware APIs on repeatables:
  - **With** `index`: change applies only to that row/set.
  - **Without** `index`: change applies to the template and all existing/future rows/sets.

## Example

```javascript
const byFieldId = { fieldId: 10 };
const byVariableName = { variableName: 'First_Name' };
const rowTwoInTableColumn = { fieldId: 31, index: 1 };
```

## Properties

### fieldId?

> `optional` **fieldId?**: `number`

Defined in: [LFForm/getters.ts:30](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L30)

Numeric field identifier. Preferred for repeatable fields.

***

### variableId?

> `optional` **variableId?**: `string`

Defined in: [LFForm/getters.ts:32](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L32)

Variable GUID string.

***

### variableName?

> `optional` **variableName?**: `string`

Defined in: [LFForm/getters.ts:34](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L34)

Variable name string. Convenient for non-repeatable fields.

***

### trackId?

> `optional` **trackId?**: `string`

Defined in: [LFForm/getters.ts:36](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L36)

Runtime-unique field instance identifier. Useful for advanced instance-specific targeting.

***

### index?

> `optional` **index?**: `number`

Defined in: [LFForm/getters.ts:38](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L38)

Row/set index for table/collection contexts (0-based).
