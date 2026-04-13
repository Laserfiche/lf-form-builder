[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / StandardFieldSettings

# Type Alias: StandardFieldSettings

> **StandardFieldSettings** = [`BaseFieldSettings`](BaseFieldSettings.md) & `object`

Defined in: types/FieldSettings.ts:42

Settings for standard input fields (SingleLine, MultiLine, etc.).
Extends [BaseFieldSettings](BaseFieldSettings.md) with placeholder and autocomplete support.

## Type Declaration

### placeholder?

> `optional` **placeholder?**: `string`

Placeholder text shown when the field is empty.

### autoCompleteValues?

> `optional` **autoCompleteValues?**: `string`[]

Autocomplete suggestion values (SingleLine fields only).
