[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / BaseFieldSettings

# Type Alias: BaseFieldSettings

> **BaseFieldSettings** = `object`

Defined in: [types/FieldSettings.ts:13](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L13)

Base field settings shared by all field types.

## Remarks

Several properties have aliases that resolve to the same setting:
- `description` ↔ `textAbove`
- `subtext` ↔ `textBelow`
- `CSSClasses` ↔ `cssClasses` ↔ `classNames`

## Properties

### label?

> `optional` **label?**: `string`

Defined in: [types/FieldSettings.ts:15](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L15)

Field label text.

***

### description?

> `optional` **description?**: `string`

Defined in: [types/FieldSettings.ts:17](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L17)

Description text displayed above the field. Alias: `textAbove`.

***

### textAbove?

> `optional` **textAbove?**: `string`

Defined in: [types/FieldSettings.ts:19](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L19)

Alias for [description](#description).

***

### subtext?

> `optional` **subtext?**: `string`

Defined in: [types/FieldSettings.ts:21](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L21)

Subtext displayed below the field. Alias: `textBelow`.

***

### textBelow?

> `optional` **textBelow?**: `string`

Defined in: [types/FieldSettings.ts:23](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L23)

Alias for [subtext](#subtext).

***

### tooltip?

> `optional` **tooltip?**: `string`

Defined in: [types/FieldSettings.ts:25](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L25)

Tooltip text shown on hover.

***

### CSSClasses?

> `optional` **CSSClasses?**: `string`[] \| `string`

Defined in: [types/FieldSettings.ts:28](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L28)

CSS classes to apply. Alias: `cssClasses`, `classNames`.

***

### cssClasses?

> `optional` **cssClasses?**: `string`[] \| `string`

Defined in: [types/FieldSettings.ts:30](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L30)

Alias for [CSSClasses](#cssclasses).

***

### classNames?

> `optional` **classNames?**: `string`[] \| `string`

Defined in: [types/FieldSettings.ts:32](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L32)

Alias for [CSSClasses](#cssclasses).
