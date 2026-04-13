# LFForm Quick Start

This guide helps you write reliable form scripts quickly with strong TypeScript hints and production-safe JavaScript patterns.

## What You Need

- A form running the LFForm runtime (not classic designer)
- Script logic running in form business logic

## Best Practice Script Shape

Use one async entry point and await LFForm state-changing calls.

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  lastName: { fieldId: 11 },
  fullName: { fieldId: 12 },
};

const setFullName = async () => {
  const first = LFForm.getFieldValues(formFields.firstName);
  const last = LFForm.getFieldValues(formFields.lastName);

  if (!first || !last) return;
  await LFForm.setFieldValues(formFields.fullName, `${last}, ${first}`);
};

LFForm.onFieldChange(setFullName, formFields.firstName);
LFForm.onFieldChange(setFullName, formFields.lastName);

const main = async () => {
  if (LFForm.isReadonly || LFForm.isPrint || LFForm.isDisabled) return;
  await setFullName();
};

main().catch(console.warn);
```

## Prefer fieldId for field identification

fieldId is the most reliable identifier, especially for table and collection fields.

Do not rely on variableName for table and collection fields.

Use index with fieldId for specific rows in repeatable contexts.

```javascript
const formFields = {
  customerName: { fieldId: 100 },
  invoiceTotalColumn: { fieldId: 200 },
};

const allRowTotals = LFForm.getFieldValues(formFields.invoiceTotalColumn);
const firstRowTotal = LFForm.getFieldValues({ fieldId: 200, index: 0 });
```

## Identification Object

Use one or more of these keys to target fields:

- `fieldId?: number`
- `variableName?: string`
- `variableId?: string`
- `trackId?: string`
- `index?: number`

`index` starts at `0` for table/collection rows.

## Read and Write Values

```javascript
const formFields = {
  email: { fieldId: 300 },
  status: { fieldId: 301 },
  choices: { fieldId: 302 },
};

const email = LFForm.getFieldValues(formFields.email);
await LFForm.setFieldValues(formFields.status, 'Ready');
await LFForm.setFieldValues(formFields.choices, { value: ['A', 'B'] });
```

## Handle Events

```javascript
const formFields = {
  email: { fieldId: 300 },
  comments: { fieldId: 400 },
};

LFForm.onFieldChange(() => console.log('changed'), formFields.email);
LFForm.onFieldBlur(() => console.log('blurred'), formFields.email);

LFForm.onFormSubmission((event) => {
  const action = event?.data?.action?.value;
  if (action === 'Reject' && !LFForm.getFieldValues(formFields.comments)) {
    return { error: 'Comments are required for Reject.' };
  }
});
```

## Get Submission Action on Submit

```javascript
LFForm.onFormSubmission(async function (event) {
  // Get the value of the clicked submission button
  const userAction = event.data.action.value;
  const approvalComments = LFForm.getFieldValues({ fieldId: 2});
  if (userAction === "Reject" && approvalComments === "") {
    await LFForm.showFields({ fieldId: 2 });
    return { error: "Please add comments in order to approve." };
  } else {
    await LFForm.hideFields({ fieldId: 2 });
  }
});
```

## Common Pitfalls

- Not awaiting mutating methods: `setFieldValues`, `showFields`, `hideFields`, `addRow`, etc.
- Writing to fields in readonly/print contexts
- Assuming table/collection calls always return a scalar (they may return arrays)
- Omitting `index` when targeting a specific row

## Where to Go Next

- [Template & Toolchain Setup](./template-setup.md) — Build form scripts with Vite and the npm packages
- [Custom HTML & Sandbox](./custom-html.md) — Using custom HTML, third-party libraries, and iframes
- [Recipes](/recipes/) — Copy-paste patterns for common form tasks
- [API Reference](/api/) — Full generated API documentation
