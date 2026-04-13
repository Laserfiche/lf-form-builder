[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / ComponentTypes

# Type Alias: ComponentTypes

> **ComponentTypes** = `object`

Defined in: types/LFFormField.ts:22

Maps component type names to their corresponding field type definitions.
Used internally for type-safe field resolution.

## Remarks

Key names match the `componentType` string on each field (e.g. `'SingleLine'`, `'Number'`, `'DateTime'`).

## Properties

### SingleLine

> **SingleLine**: [`TextField`](TextField.md)

Defined in: types/LFFormField.ts:23

***

### Email

> **Email**: [`TextField`](TextField.md)

Defined in: types/LFFormField.ts:24

***

### RichText

> **RichText**: [`TextField`](TextField.md)

Defined in: types/LFFormField.ts:25

***

### MultiLine

> **MultiLine**: [`TextField`](TextField.md)

Defined in: types/LFFormField.ts:26

***

### Number

> **Number**: [`NumberField`](NumberField.md)

Defined in: types/LFFormField.ts:27

***

### Currency

> **Currency**: [`NumberField`](NumberField.md)

Defined in: types/LFFormField.ts:28

***

### DateTime

> **DateTime**: [`DateField`](DateField.md)

Defined in: types/LFFormField.ts:29

***

### Geolocation

> **Geolocation**: [`GeolocationField`](GeolocationField.md)

Defined in: types/LFFormField.ts:30

***

### Address

> **Address**: [`AddressField`](AddressField.md)

Defined in: types/LFFormField.ts:31

***

### Checkbox

> **Checkbox**: [`CheckboxField`](CheckboxField.md)

Defined in: types/LFFormField.ts:32

***

### Radio

> **Radio**: [`RadioField`](RadioField.md)

Defined in: types/LFFormField.ts:33

***

### Dropdown

> **Dropdown**: [`DropdownField`](DropdownField.md)

Defined in: types/LFFormField.ts:34

***

### Table

> **Table**: [`TableField`](TableField.md)

Defined in: types/LFFormField.ts:35

***

### Collection

> **Collection**: [`CollectionField`](CollectionField.md)

Defined in: types/LFFormField.ts:36

***

### Signature

> **Signature**: [`SignatureField`](SignatureField.md)

Defined in: types/LFFormField.ts:37

***

### FileUpload

> **FileUpload**: [`FileUploadField`](FileUploadField.md)

Defined in: types/LFFormField.ts:38

***

### CustomHTML

> **CustomHTML**: [`CustomHtmlField`](CustomHtmlField.md)

Defined in: types/LFFormField.ts:39

***

### Section

> **Section**: [`SectionField`](SectionField.md)

Defined in: types/LFFormField.ts:40

***

### Form

> **Form**: [`LFFormFormPart`](LFFormFormPart.md)

Defined in: types/LFFormField.ts:41

***

### Page

> **Page**: [`LFFormPagePart`](LFFormPagePart.md)

Defined in: types/LFFormField.ts:42
