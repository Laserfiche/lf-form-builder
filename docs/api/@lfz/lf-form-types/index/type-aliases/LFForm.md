[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFForm

# Type Alias: LFForm\<FieldType\>

> **LFForm**\<`FieldType`\> = [`LFFormProperties`](LFFormProperties.md) & [`LFFormGetterApi`](LFFormGetterApi.md)\<`FieldType`\> & [`LFFormMethodApi`](LFFormMethodApi.md)\<`FieldType`\> & [`LFFormEventApi`](LFFormEventApi.md)

Defined in: [LFForm/index.ts:54](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/index.ts#L54)

The full LFForm runtime API — the global interface for interacting with
Laserfiche form fields, settings, and events in JavaScript.

Core capabilities:
- Read and write field values
- Show, hide, enable, and disable fields
- Change field and form settings at runtime
- Add and remove rows/sets in tables and collections
- Add and remove CSS classes on fields
- Query fields by predicate or identifier
- Validate fields
- Subscribe to field, form, and lookup events

## Type Parameters

### FieldType

`FieldType` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

The typed field reference used by getter/setter/method APIs.

## Remarks

- Use a shared `formFields` object and prefer `fieldId` for reliability.
- Await mutating methods before continuing to ensure changes are applied.
- Gate mutations when `isReadonly`, `isDisabled`, or `isPrint` is `true`.
- LFForm is not available in classic designer.

## Example

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  lastName: { fieldId: 11 },
  expenseTable: { fieldId: 30 },
};

const name = LFForm.getFieldValues(formFields.firstName);
await LFForm.setFieldValues(formFields.lastName, 'Doe');
await LFForm.showFields(formFields.firstName);
await LFForm.addRow(formFields.expenseTable, 2);
```

## Sort Strategy

source-order
