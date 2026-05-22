[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / StandardFieldSettings

# Type Alias: StandardFieldSettings

> **StandardFieldSettings** = [`BaseFieldSettings`](BaseFieldSettings.md) & `object`

Defined in: [types/FieldSettings.ts:42](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FieldSettings.ts#L42)

Settings for standard input fields (SingleLine, MultiLine, etc.).
Extends [BaseFieldSettings](BaseFieldSettings.md) with placeholder and autocomplete support.

## Type Declaration

### placeholder?

> `optional` **placeholder?**: `string`

Placeholder text shown when the field is empty.

### autoCompleteValues?

> `optional` **autoCompleteValues?**: `string`[]

Autocomplete suggestion values (SingleLine fields only).
