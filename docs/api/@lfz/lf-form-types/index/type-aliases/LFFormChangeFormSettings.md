[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormChangeFormSettings

# Type Alias: LFFormChangeFormSettings

> **LFFormChangeFormSettings** = `object`

Defined in: [types/FormSettings.ts:21](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FormSettings.ts#L21)

Settings object accepted by `LFForm.changeFormSettings()` to update
form-level title, description, browser title, and pagination labels.

## Example

```javascript
await LFForm.changeFormSettings({
  title: 'Expense Report',
  browserTitle: 'Expense Report | Internal',
  description: 'Complete all required fields.',
  pagination: [
    { pageId: 1, label: 'Request Details' },
    { pageId: 2, label: 'Approval', prevButton: 'Back', nextButton: 'Continue' },
  ],
});
```

## Properties

### title?

> `optional` **title?**: `string`

Defined in: [types/FormSettings.ts:23](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FormSettings.ts#L23)

Form title displayed at the top of the form.

***

### browserTitle?

> `optional` **browserTitle?**: `string`

Defined in: [types/FormSettings.ts:25](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FormSettings.ts#L25)

Updates the browser tab / window title.

***

### description?

> `optional` **description?**: `string`

Defined in: [types/FormSettings.ts:27](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FormSettings.ts#L27)

Form description text displayed below the title.

***

### pagination?

> `optional` **pagination?**: `object`[]

Defined in: [types/FormSettings.ts:29](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/types/FormSettings.ts#L29)

Per-page pagination label and button overrides.

#### pageId

> **pageId**: `number`

Page identifier (numeric).

#### label?

> `optional` **label?**: `string`

Display label for the page tab.

#### prevButton?

> `optional` **prevButton?**: `string`

Label for the "Previous" navigation button on this page.

#### nextButton?

> `optional` **nextButton?**: `string`

Label for the "Next" navigation button on this page.
