[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / BaseFieldSettings

# Type Alias: BaseFieldSettings

> **BaseFieldSettings** = `object`

Defined in: types/FieldSettings.ts:13

Base field settings shared by all field types.

## Remarks

Several properties have aliases that resolve to the same setting:
- `description` ↔ `textAbove`
- `subtext` ↔ `textBelow`
- `CSSClasses` ↔ `cssClasses` ↔ `classNames`

## Properties

### label?

> `optional` **label?**: `string`

Defined in: types/FieldSettings.ts:15

Field label text.

***

### description?

> `optional` **description?**: `string`

Defined in: types/FieldSettings.ts:17

Description text displayed above the field. Alias: `textAbove`.

***

### textAbove?

> `optional` **textAbove?**: `string`

Defined in: types/FieldSettings.ts:19

Alias for [description](#description).

***

### subtext?

> `optional` **subtext?**: `string`

Defined in: types/FieldSettings.ts:21

Subtext displayed below the field. Alias: `textBelow`.

***

### textBelow?

> `optional` **textBelow?**: `string`

Defined in: types/FieldSettings.ts:23

Alias for [subtext](#subtext).

***

### tooltip?

> `optional` **tooltip?**: `string`

Defined in: types/FieldSettings.ts:25

Tooltip text shown on hover.

***

### CSSClasses?

> `optional` **CSSClasses?**: `string`[] \| `string`

Defined in: types/FieldSettings.ts:28

CSS classes to apply. Alias: `cssClasses`, `classNames`.

***

### cssClasses?

> `optional` **cssClasses?**: `string`[] \| `string`

Defined in: types/FieldSettings.ts:30

Alias for [CSSClasses](#cssclasses).

***

### classNames?

> `optional` **classNames?**: `string`[] \| `string`

Defined in: types/FieldSettings.ts:32

Alias for [CSSClasses](#cssclasses).
