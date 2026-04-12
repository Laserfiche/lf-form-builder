# LFForm API Reference (Full Pass)

This page is a full, description-rich pass aligned with the live LFForm documentation, with practical implementation guidance for this repository.

## Purpose and Scope

The LFForm object provides a global interface for interacting with Laserfiche form fields, settings, and events in JavaScript.

Core capabilities:
- Read and write field values
- Show, hide, enable, and disable fields
- Change field and form settings at runtime
- Add and remove rows/sets in tables and collections
- Add and remove CSS classes on fields
- Query fields by predicate or identifier
- Validate fields
- Subscribe to field, form, and lookup events

Note:
- LFForm is not available in classic designer.

---

## Best Practice Conventions

Use a shared formFields object and prefer fieldId for reliability.

- Preferred for repeatable fields (table/collection): fieldId + index
- variableName can be convenient for non-repeatable fields
- Do not rely on variableName for table/collection fields; use fieldId
- trackId is runtime-generated and useful for advanced, instance-specific targeting

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  lastName: { fieldId: 11 },
  fullName: { fieldId: 12 },
  expenseTable: { fieldId: 30 },
  expenseAmountColumn: { fieldId: 31 },
  comments: { fieldId: 40 },
};
```

Execution order guidance:
- Put business logic in async functions.
- Await mutating LFForm methods.
- For repeatables, create rows/sets first, then set field values.

---

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

Identification objects define which field(s) an LFForm method should act on.

### Properties

- fieldId: numeric field identifier
- variableName: variable name string
- variableId: variable guid string
- trackId: runtime-unique field instance id
- index: row/set index for table/collection contexts, starting at 0

### Table/Collection template behavior

For template-aware methods on repeatables:
- With index, change applies only to that row/set instance.
- Without index, change applies to template and all existing/future rows/sets.

### Examples

```javascript
const byFieldId = { fieldId: 10 };
const byVariableName = { variableName: 'First_Name' };
const byVariableId = { variableId: 'e7c9e10c-eeb0-4ce2-b3c6-26264c7fe655' };
const rowTwoInTableColumn = { fieldId: 31, index: 1 };
```

---

## Runtime Properties

The LFForm object includes process and context metadata:

- step: { id: string; name: string } | null
- stage: { id: string; name: string } | null
- language: string | null
- locale: string | null
- isCloud: boolean
- isPreview: boolean
- isReadonly: boolean
- isDisabled: boolean
- isPrint: boolean
- isAnonymousUser: boolean
- isDraft: boolean
- pageURL: string

Typical usage:
- Gate mutations when isReadonly, isDisabled, or isPrint is true.
- Branch behavior by step/stage/language.

---

## Field Value Types

### Supported get/set value shapes

- SingleLine, MultiLine, Dropdown, RichText, Signature: string
- Number, Currency: number
- Checkbox: { value: string[]; otherChoiceValue?: string }
- Radio: { value: string; otherChoiceValue?: string }
- Geolocation: { latitude: number; longitude: number }
- Address: { address1?: string; address2?: string; city?: string; country?: string; province?: string; zipcode?: string }
- DateTime: { dateStr: string; timeStr?: string }
- Time: { timeStr: string }

### Not supported for direct get/set

- Collection
- Table
- FileUpload
- Fileset

---

## getFieldValues

### Description

Gets values for fields matching the provided identifier(s).

### Signature

```ts
LFForm.getFieldValues(id: LFFormIdParam): LFFormGetFieldValue | LFFormGetFieldValue[];
```

### Input

- id: one identification object or an array

### Output behavior

- If one match: returns one value
- If multiple matches: returns array
- If index is supplied: returns that specific row/set value
- A table column with one row returns a single value (not array)

### Examples

```javascript
const firstName = LFForm.getFieldValues(formFields.firstName);
const amounts = LFForm.getFieldValues(formFields.expenseAmountColumn);
const firstRowAmount = LFForm.getFieldValues({ fieldId: 31, index: 0 });
```

---

## setFieldValues

### Description

Sets values for fields matching the provided identifier(s).

### Signature

```ts
LFForm.setFieldValues(id: LFFormIdParam, value: LFFormSetFieldValue): Promise<LFFormPromiseResponse>;
```

### Input

- id: one identification object or an array
- value: field-typed value or row-ordered array for repeatable matches

### Output

- Promise resolving with success/error response

### Validation and error behavior

- Read-only fields cannot be changed
- Value type must match field type
- Date/time values must match configured format

### Single vs repeatable behavior

- Single field: pass scalar/object value
- Repeatable column all rows: pass scalar or row-ordered array
- Specific row/set: use index

### Examples

```javascript
await LFForm.setFieldValues(formFields.firstName, 'Jane');
await LFForm.setFieldValues(formFields.expenseAmountColumn, 0);
await LFForm.setFieldValues(formFields.expenseAmountColumn, [120, 80, 55]);
await LFForm.setFieldValues({ fieldId: 31, index: 0 }, 120);
```

---

## showFields

### Description

Shows target fields. Template-aware for repeatables.

### Signature

```ts
LFForm.showFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

### Input

- id as object, array, or variadic objects

### Output

- Promise resolving after UI updates

---

## hideFields

### Description

Hides target fields. Template-aware for repeatables.

### Signature

```ts
LFForm.hideFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

### Output

- Promise resolving after UI updates

---

## disableFields

### Description

Disables target fields. Template-aware for repeatables.

### Signature

```ts
LFForm.disableFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

---

## enableFields

### Description

Enables target fields. Template-aware for repeatables.

### Signature

```ts
LFForm.enableFields(id: LFFormIdParam, ...ids: LFFormId[]): Promise<LFFormPromiseResponse>;
```

### Example (show/hide/disable/enable)

```javascript
await LFForm.showFields(formFields.comments);
await LFForm.hideFields(formFields.comments);
await LFForm.disableFields(formFields.comments);
await LFForm.enableFields(formFields.comments);
```

---

## changeFieldSettings

### Description

Changes settings on target fields. Template-aware for repeatables.

### Signature

```ts
LFForm.changeFieldSettings(id: LFFormIdParam, settingChanges: object): Promise<LFFormPromiseResponse>;
```

### Input

- id: one identification object or array
- settingChanges: key/value patch object

### Supported keys

- label
- description (alias: textAbove)
- subtext (alias: textBelow)
- tooltip
- placeholder
- autoCompleteValues (SingleLine only)
- content (alias: default, HTMLContent; CustomHTML only)
- CSSClasses (alias: cssClasses, classNames)
- buttonLabel (alias: signButtonLabel, uploadButtonLabel)
- rowLabels
- addButtonLabel (alias: addRowButtonLabel, addSetButtonLabel)
- prevButton
- nextButton
- addressOptions

### addressOptions shape

```ts
{
  subField: 'address1' | 'address2' | 'city' | 'country' | 'province' | 'zipcode';
  label?: string;
  show?: boolean;
}
```

### Output

- Promise resolving after setting updates are applied

### Examples

```javascript
await LFForm.changeFieldSettings(formFields.firstName, {
  label: 'Given Name',
  description: 'Use your legal first name',
  placeholder: 'John',
});

await LFForm.changeFieldSettings({ fieldId: 80 }, {
  addressOptions: [
    { subField: 'zipcode', label: 'Zip Code', show: true },
    { subField: 'country', show: false },
  ],
});
```

---

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

- changes object with supported form keys

### Output

- Promise resolving after form settings are updated

### Notes

- browserTitle updates tab/window title in supported runtime contexts.

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

---

## changeActionButton

### Description

Changes one action button label.

### Signature

```ts
LFForm.changeActionButton(button: 'Submit' | 'Approve' | 'Reject' | 'SaveAsDraft' | string, changes: { label: string }): Promise<LFFormPromiseResponse>;
```

### Input

- button: default button class or custom action class
- changes: currently supports label

### Output

- Promise resolving after update

---

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

---

## addRow and addSet

### Description

Adds rows/sets to table/collection targets.

### Signature

```ts
LFForm.addRow(id: LFFormIdParam, count: number): Promise<LFFormPromiseResponse>;
LFForm.addSet(id: LFFormIdParam, count: number): Promise<LFFormPromiseResponse>;
```

### Input

- id: table/collection id
- count: number of rows/sets to add

### Output

- Promise resolving after operation

---

## deleteRow and deleteSet

### Description

Deletes specific rows/sets from table/collection targets.

### Signature

```ts
LFForm.deleteRow(id: LFFormIdParam, ...index: number[]): Promise<LFFormPromiseResponse>;
LFForm.deleteSet(id: LFFormIdParam, ...index: number[]): Promise<LFFormPromiseResponse>;
```

### Input

- id: table/collection id
- index: one or more indexes

### Output

- Promise resolving after operation

### Example (table/collection)

```javascript
await LFForm.addRow(formFields.expenseTable, 3);
await LFForm.deleteRow(formFields.expenseTable, 0);
```

---

## addCSSClasses

### Description

Adds CSS classes to target fields.

### Signature

```ts
LFForm.addCSSClasses(id: LFFormIdParam, classes: string | string[]): Promise<LFFormPromiseResponse>;
```

### Notes

- Existing classes are not duplicated.

---

## removeCSSClasses

### Description

Removes CSS classes from target fields.

### Signature

```ts
LFForm.removeCSSClasses(id: LFFormIdParam, classes: string | string[]): Promise<LFFormPromiseResponse>;
```

### Notes

- Removing non-existent classes is ignored.

### Example (CSS classes)

```javascript
await LFForm.addCSSClasses({ fieldId: 100 }, 'highlight urgent');
await LFForm.removeCSSClasses({ fieldId: 100 }, ['urgent']);
```

---

## findFields

### Description

Finds fields matching an arbitrary predicate.

### Signature

```ts
LFForm.findFields(predicate: (field: LFFormField) => boolean): LFFormField[];
```

---

## findFieldsByClassName

### Description

Finds fields by CSS class name.

### Signature

```ts
LFForm.findFieldsByClassName(className: string): LFFormField[];
```

---

## findFieldsByFieldId

### Description

Finds fields by fieldId.

### Signature

```ts
LFForm.findFieldsByFieldId(fieldId: number): LFFormField[];
```

---

## findFieldsByVariableName

### Description

Finds fields by variableName.

### Signature

```ts
LFForm.findFieldsByVariableName(variableName: string): LFFormField[];
```

---

## findFieldsByVariableId

### Description

Finds fields by variableId.

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

---

## validateFields

### Description

Adds or removes validation settings on target fields.

### Signature

```ts
LFForm.validateFields(id: LFFormIdParam, validationOptions: { required: boolean }): Promise<LFFormPromiseResponse>;
```

### Input

- validationOptions.required: toggles required state

### Output

- Promise resolving after validation setting changes

### Example

```javascript
await LFForm.validateFields({ fieldId: 110 }, { required: true });
```

---

## Event APIs

Supported events:
- formSubmission
- fieldChange
- fieldBlur
- lookupTrigger
- lookupDone

## subscribe

### Description

Subscribes handler to an LFForm event.

### Signature

```ts
LFForm.subscribe(eventName, handler, options): void;
```

### Input

- eventName: one of supported events
- handler: callback to execute on event
- options: identification/options object; handlerName is supported

---

## unsubscribe

### Description

Unsubscribes handler from an LFForm event.

### Signature

```ts
LFForm.unsubscribe(eventName, options): void;
```

---

## onFormSubmission

### Description

Registers a submission handler.

### Signature

```ts
LFForm.onFormSubmission(handler, options?): void;
```

### Notes

- Return { error: string } to block submission and show message.
- Async handlers are supported.
- Event includes action metadata in data.action.

---

## onFieldChange and onFieldBlur

### Description

Registers field-level change/blur handlers.

### Signature

```ts
LFForm.onFieldChange(handler, options): void;
LFForm.onFieldBlur(handler, options): void;
```

---

## onLookupTrigger and onLookupDone

### Description

Registers lookup lifecycle handlers.

### Signature

```ts
LFForm.onLookupTrigger(handler, { lookupRuleId, handlerName? }): void;
LFForm.onLookupDone(handler, { lookupRuleId, handlerName? }): void;
```

### Notes

- Returning { cancelLookup: true } in onLookupTrigger cancels the lookup.
- lookupRuleId corresponds to Rules pane numbering.

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
