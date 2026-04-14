[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / ComponentTypes

# Type Alias: ComponentTypes

> **ComponentTypes** = `object`

Defined in: [types/LFFormField.ts:22](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L22)

Maps component type names to their corresponding field type definitions.
Used internally for type-safe field resolution.

## Remarks

Key names match the `componentType` string on each field (e.g. `'SingleLine'`, `'Number'`, `'DateTime'`).

## Properties

### SingleLine

> **SingleLine**: [`TextField`](TextField.md)

Defined in: [types/LFFormField.ts:23](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L23)

***

### Email

> **Email**: [`TextField`](TextField.md)

Defined in: [types/LFFormField.ts:24](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L24)

***

### RichText

> **RichText**: [`TextField`](TextField.md)

Defined in: [types/LFFormField.ts:25](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L25)

***

### MultiLine

> **MultiLine**: [`TextField`](TextField.md)

Defined in: [types/LFFormField.ts:26](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L26)

***

### Number

> **Number**: [`NumberField`](NumberField.md)

Defined in: [types/LFFormField.ts:27](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L27)

***

### Currency

> **Currency**: [`NumberField`](NumberField.md)

Defined in: [types/LFFormField.ts:28](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L28)

***

### DateTime

> **DateTime**: [`DateField`](DateField.md)

Defined in: [types/LFFormField.ts:29](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L29)

***

### Geolocation

> **Geolocation**: [`GeolocationField`](GeolocationField.md)

Defined in: [types/LFFormField.ts:30](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L30)

***

### Address

> **Address**: [`AddressField`](AddressField.md)

Defined in: [types/LFFormField.ts:31](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L31)

***

### Checkbox

> **Checkbox**: [`CheckboxField`](CheckboxField.md)

Defined in: [types/LFFormField.ts:32](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L32)

***

### Radio

> **Radio**: [`RadioField`](RadioField.md)

Defined in: [types/LFFormField.ts:33](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L33)

***

### Dropdown

> **Dropdown**: [`DropdownField`](DropdownField.md)

Defined in: [types/LFFormField.ts:34](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L34)

***

### Table

> **Table**: [`TableField`](TableField.md)

Defined in: [types/LFFormField.ts:35](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L35)

***

### Collection

> **Collection**: [`CollectionField`](CollectionField.md)

Defined in: [types/LFFormField.ts:36](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L36)

***

### Signature

> **Signature**: [`SignatureField`](SignatureField.md)

Defined in: [types/LFFormField.ts:37](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L37)

***

### FileUpload

> **FileUpload**: [`FileUploadField`](FileUploadField.md)

Defined in: [types/LFFormField.ts:38](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L38)

***

### CustomHTML

> **CustomHTML**: [`CustomHtmlField`](CustomHtmlField.md)

Defined in: [types/LFFormField.ts:39](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L39)

***

### Section

> **Section**: [`SectionField`](SectionField.md)

Defined in: [types/LFFormField.ts:40](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L40)

***

### Form

> **Form**: [`LFFormFormPart`](LFFormFormPart.md)

Defined in: [types/LFFormField.ts:41](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L41)

***

### Page

> **Page**: [`LFFormPagePart`](LFFormPagePart.md)

Defined in: [types/LFFormField.ts:42](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/LFFormField.ts#L42)
