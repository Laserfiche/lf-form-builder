# LFForm API Reference

This reference aligns with the live LFForm documentation and includes practical guidance for production scripts.

## Best Practice Conventions

Use a shared `formFields` object and prefer `fieldId` for reliability.

- Preferred for repeatable fields (table/collection): `fieldId` + `index`
- `variableName` can be convenient for non-repeatable fields
- Do not rely on `variableName` for table/collection fields; use `fieldId`
- `trackId` is a runtime identifier that can be useful in advanced flows

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  lastName: { fieldId: 11 },
  fullName: { fieldId: 12 },
  expenseTable: { fieldId: 30 },
  expenseAmountColumn: { fieldId: 31 },
};
```

## Identification Object

### Type

```ts
type LFFormId = {
  fieldId?: number;
  variableName?: string;
  variableId?: string;
  trackId?: string;
  index?: number;
};

type LFFormIdParam = LFFormId | LFFormId[];
```

### Description

An identification object tells LFForm which fields to target.

### Notes

- `index` starts at `0`.
- In most LFForm APIs, you can pass a single object or an array.
- For template-aware APIs on table/collection fields:
  - With `index`: change applies only to that row/set.
  - Without `index`: change applies to template and existing/future rows/sets.

## Runtime Properties

- `step: { id: string; name: string } | null`
- `stage: { id: string; name: string } | null`
- `language: string | null`
- `locale: string | null`
- `isCloud: boolean`
- `isPreview: boolean`
- `isReadonly: boolean`
- `isDisabled: boolean`
- `isPrint: boolean`
- `isAnonymousUser: boolean`
- `isDraft: boolean`
- `pageURL: string`

## Field Value Types

### Supported get/set value shapes

- SingleLine, MultiLine, Dropdown, RichText, Signature: `string`
- Number, Currency: `number`
- Checkbox: `{ value: string[]; otherChoiceValue?: string }`
- Radio: `{ value: string; otherChoiceValue?: string }`
- Geolocation: `{ latitude: number; longitude: number }`
- Address: `{ address1?: string; address2?: string; city?: string; country?: string; province?: string; zipcode?: string }`
- DateTime: `{ dateStr: string; timeStr?: string }`
- Time: `{ timeStr: string }`

### Not supported for direct get/set

- Collection
- Table
- FileUpload
- Fileset

## getFieldValues

### Description

Gets field values for one or more matching fields.

### Signature

```ts
LFForm.getFieldValues(id: LFFormIdParam): LFFormGetFieldValue | LFFormGetFieldValue[];
```

### Input

- `id`: identification object or array of identification objects.

### Output

- If exactly one field matches, returns one value.
- If multiple fields match (for example across table/collection rows), returns an array.
- A table column with one row returns a single value (not an array).

### Example

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  expenseAmountColumn: { fieldId: 31 },
};

const firstName = LFForm.getFieldValues(formFields.firstName);
const allRowAmounts = LFForm.getFieldValues(formFields.expenseAmountColumn);
const firstRowAmount = LFForm.getFieldValues({ fieldId: 31, index: 0 });
```

## setFieldValues

### Description

Sets field values for one or more matching fields.

### Signature

```ts
LFForm.setFieldValues(id: LFFormIdParam, value: LFFormSetFieldValue): Promise<LFFormPromiseResponse>;
```

### Input

- `id`: identification object or array.
- `value`: field-typed value or row-ordered value array for repeatable matches.

### Output

- Returns a promise resolving to success/error response.

### Throws/Validation

- Read-only fields cannot be changed. Use disabled in field rules instead.
- Value type must match field type.
- Date/time values must match field formatting rules.

### Repeatable behavior

- One value: set a single field.
- Scalar value against repeatable column: set every row.
- Array against repeatable column: set each row by index.
- Use `index` to target one row/set.

### Example

```javascript
const formFields = {
  status: { fieldId: 40 },
  expenseAmountColumn: { fieldId: 31 },
  foodChoice: { fieldId: 50 },
  geolocation: { fieldId: 60 },
};

await LFForm.setFieldValues(formFields.status, 'Open');
await LFForm.setFieldValues(formFields.foodChoice, { value: ['Option1', 'Option2'] });
await LFForm.setFieldValues(formFields.geolocation, { latitude: 33.68, longitude: -117.82 });

await LFForm.setFieldValues(formFields.expenseAmountColumn, 0);
await LFForm.setFieldValues(formFields.expenseAmountColumn, [120, 80, 55]);
await LFForm.setFieldValues({ fieldId: 31, index: 0 }, 120);
```

## showFields

### Description

Shows target fields. Template-aware for table/collection fields.

### Signature

```ts
LFForm.showFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

### Input

- One id, array of ids, or variadic ids.

### Output

- Promise that resolves after changes are applied.

## hideFields

### Description

Hides target fields. Template-aware for table/collection fields.

### Signature

```ts
LFForm.hideFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

### Input/Output

- Same behavior as `showFields`.

## disableFields

### Description

Disables target fields. Template-aware for table/collection fields.

### Signature

```ts
LFForm.disableFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

## enableFields

### Description

Enables target fields. Template-aware for table/collection fields.

### Signature

```ts
LFForm.enableFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

### Example (show/hide/disable/enable)

```javascript
const formFields = {
  managerComments: { fieldId: 70 },
  tableRow2: { fieldId: 3, index: 1 },
  tableRow4: { fieldId: 3, index: 3 },
};

await LFForm.showFields(formFields.managerComments);
await LFForm.hideFields([formFields.tableRow2, formFields.tableRow4]);
await LFForm.disableFields(formFields.managerComments);
await LFForm.enableFields(formFields.managerComments);
```

## changeFieldSettings

### Description

Changes settings on target fields. Template-aware for table/collection fields.

### Signature

```ts
LFForm.changeFieldSettings(id: LFFormIdParam, settingChanges: object): Promise<LFFormPromiseResponse>;
```

### Input

- `id`: identification object or array.
- `settingChanges`: key/value object of supported properties.

### Supported setting keys

- `label`
- `description` (alias: `textAbove`)
- `subtext` (alias: `textBelow`)
- `tooltip`
- `placeholder`
- `autoCompleteValues` (SingleLine only)
- `content` (alias: `default`, `HTMLContent`; CustomHTML only)
- `CSSClasses` (alias: `cssClasses`, `classNames`)
- `buttonLabel` (alias: `signButtonLabel`, `uploadButtonLabel`)
- `rowLabels`
- `addButtonLabel` (alias: `addRowButtonLabel`, `addSetButtonLabel`)
- `prevButton`
- `nextButton`
- `addressOptions`

### Output

- Promise that resolves after setting changes are applied.

### Example

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  address: { fieldId: 80 },
};

await LFForm.changeFieldSettings(formFields.firstName, {
  label: 'Given Name',
  description: 'Use your legal first name',
  placeholder: 'John',
  tooltip: 'As shown on your ID',
});

await LFForm.changeFieldSettings(formFields.address, {
  addressOptions: [
    { subField: 'zipcode', label: 'Zip Code', show: true },
    { subField: 'country', show: false },
  ],
});
```

## changeFormSettings

### Description

Changes form-level settings.

### Signature

```ts
LFForm.changeFormSettings(changes: {
  title?: string;
  browserTitle?: string;
  description?: string;
  pagination?: Array<{ pageId: number; label?: string; prevButton?: string; nextButton?: string }>;
}): Promise<LFFormPromiseResponse>;
```

### Input

- `changes`: object of form setting changes.

### Output

- Promise that resolves after updates are applied.

### Notes

- `browserTitle` updates the browser tab/window title.

### Example

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

## changeActionButton

### Description

Changes label for one action button.

### Signature

```ts
LFForm.changeActionButton(button: 'Submit' | 'Approve' | 'Reject' | 'SaveAsDraft' | string, changes: { label: string }): Promise<LFFormPromiseResponse>;
```

### Input

- `button`: default action class or custom action class.
- `changes`: action button updates (currently label).

### Output

- Promise that resolves after change is applied.

## changeActionButtons

### Description

Changes labels for multiple action buttons.

### Signature

```ts
LFForm.changeActionButtons(changes: Array<{ action: 'Submit' | 'Approve' | 'Reject' | 'SaveAsDraft' | string; label: string }>): Promise<LFFormPromiseResponse>;
```

### Example (action buttons)

```javascript
await LFForm.changeActionButton('Submit', { label: 'Send Request' });
await LFForm.changeActionButtons([
  { action: 'Approve', label: 'Approve Request' },
  { action: 'Reject', label: 'Reject Request' },
  { action: 'SaveAsDraft', label: 'Save Draft' },
]);
```

## addRow and addSet

### Description

Adds new rows/sets to table/collection fields.

### Signature

```ts
LFForm.addRow(id: LFFormIdParam, count: number): Promise<LFFormPromiseResponse>;
LFForm.addSet(id: LFFormIdParam, count: number): Promise<LFFormPromiseResponse>;
```

### Input

- `id`: table/collection target.
- `count`: number to add.

### Output

- Promise resolving after rows/sets are added.

## deleteRow and deleteSet

### Description

Deletes specific rows/sets from table/collection fields.

### Signature

```ts
LFForm.deleteRow(id: LFFormIdParam, ...index: number[]): Promise<LFFormPromiseResponse>;
LFForm.deleteSet(id: LFFormIdParam, ...index: number[]): Promise<LFFormPromiseResponse>;
```

### Input

- `id`: table/collection target.
- `index`: one or more row/set indexes.

### Output

- Promise resolving after deletion.

### Example (table/collection)

```javascript
const formFields = {
  expenseTable: { fieldId: 30 },
  infoCollection: { fieldId: 90 },
};

await LFForm.addRow(formFields.expenseTable, 3);
await LFForm.addSet(formFields.infoCollection, 2);
await LFForm.deleteRow(formFields.expenseTable, 0);
await LFForm.deleteSet(formFields.infoCollection, 0, 1);
```

## addCSSClasses

### Description

Adds CSS classes to target fields.

### Signature

```ts
LFForm.addCSSClasses(id: LFFormIdParam, classes: string | string[]): Promise<LFFormPromiseResponse>;
```

### Notes

- Existing classes are not duplicated.

## removeCSSClasses

### Description

Removes CSS classes from target fields.

### Signature

```ts
LFForm.removeCSSClasses(id: LFFormIdParam, classes: string | string[]): Promise<LFFormPromiseResponse>;
```

### Notes

- Removing a class that does not exist is ignored.

### Example (CSS classes)

```javascript
const formFields = {
  reviewBanner: { fieldId: 100 },
};

await LFForm.addCSSClasses(formFields.reviewBanner, 'highlight urgent');
await LFForm.removeCSSClasses(formFields.reviewBanner, ['urgent']);
```

## findFields

### Description

Finds fields by arbitrary predicate.

### Signature

```ts
LFForm.findFields(predicate: (field: LFFormField) => boolean): LFFormField[];
```

## findFieldsByClassName

### Signature

```ts
LFForm.findFieldsByClassName(className: string): LFFormField[];
```

## findFieldsByFieldId

### Signature

```ts
LFForm.findFieldsByFieldId(fieldId: number): LFFormField[];
```

## findFieldsByVariableName

### Signature

```ts
LFForm.findFieldsByVariableName(variableName: string): LFFormField[];
```

## findFieldsByVariableId

### Signature

```ts
LFForm.findFieldsByVariableId(variableId: string): LFFormField[];
```

### Example (find APIs)

```javascript
const required = LFForm.findFields((f) => Boolean(f.settings?.required));
const idMatches = LFForm.findFieldsByFieldId(10);
const classMatches = LFForm.findFieldsByClassName('blue');
```

## validateFields

### Description

Adds or removes validation settings on target fields.

### Signature

```ts
LFForm.validateFields(id: LFFormIdParam, validationOptions: { required: boolean }): Promise<LFFormPromiseResponse>;
```

### Input

- `validationOptions.required`: toggles required state.

### Example

```javascript
const formFields = { costCenter: { fieldId: 110 } };
await LFForm.validateFields(formFields.costCenter, { required: true });
```

## Event APIs

Supported event names:

- `formSubmission`
- `fieldChange`
- `fieldBlur`
- `lookupTrigger`
- `lookupDone`

## subscribe

### Description

Subscribes a handler to an LFForm event.

### Signature

```ts
LFForm.subscribe(eventName, handler, options): void;
```

## unsubscribe

### Description

Unsubscribes a handler from an LFForm event.

### Signature

```ts
LFForm.unsubscribe(eventName, options): void;
```

## onFormSubmission

### Description

Registers a form submission handler.

### Signature

```ts
LFForm.onFormSubmission(handler, options?): void;
```

### Notes

- If handler returns `{ error: string }`, submission is blocked and error is shown.
- Async handlers are supported.
- Event includes action metadata in data.action.

## onFieldChange and onFieldBlur

### Signature

```ts
LFForm.onFieldChange(handler, options): void;
LFForm.onFieldBlur(handler, options): void;
```

### Notes

- Use `onFieldChange()` when your logic depends on the field's updated value already being available.
- This is the safer choice when reacting to lookup-populated fields or recalculating adjacent field output.
- `onFieldBlur()` is useful for lighter validation or formatting after a user leaves a field.

## onLookupTrigger and onLookupDone

### Signature

```ts
LFForm.onLookupTrigger(handler, { lookupRuleId, handlerName? }): void;
LFForm.onLookupDone(handler, { lookupRuleId, handlerName? }): void;
```

### Notes

- `onLookupTrigger()` runs before the lookup request is sent.
- Use `onLookupTrigger()` to inspect inputs, block a lookup, or adjust pre-lookup behavior.
- Do not assume lookup target fields have been populated when `onLookupDone()` runs.
- If your logic needs the resulting field value, prefer `onFieldChange()` on the destination field instead of relying on lookup timing.
- If `onLookupTrigger` returns `{ cancelLookup: true }`, LFForm cancels the lookup call.
- `lookupRuleId` matches the rule number in the Rules pane.

### Example (events)

```javascript
const formFields = {
  approvalComments: { fieldId: 120 },
  firstName: { fieldId: 10 },
  triggerField: { fieldId: 130 },
  lookupTarget: { fieldId: 131 },
};

LFForm.subscribe('fieldChange', () => console.log('changed'), formFields.firstName);
LFForm.unsubscribe('fieldChange', formFields.firstName);

LFForm.onFormSubmission((event) => {
  const action = event?.data?.action?.value;
  const comments = LFForm.getFieldValues(formFields.approvalComments);
  if (action === 'Reject' && !comments) {
    return { error: 'Comments are required when rejecting.' };
  }
});

LFForm.onLookupTrigger(() => {
  if (LFForm.getFieldValues(formFields.triggerField) === 'NoCall') {
    return { cancelLookup: true };
  }
}, { lookupRuleId: 3 });

LFForm.onLookupDone(() => {
  if (LFForm.getFieldValues(formFields.lookupTarget) === 'Hello') {
    LFForm.setFieldValues(formFields.lookupTarget, 'World!');
  }
}, { lookupRuleId: 2 });
```
