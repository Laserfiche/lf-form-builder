# LFForm Recipes

Practical patterns you can copy and adapt.

## Show/Hide Fields from Dropdown Selection

```javascript
const formFields = {
  requestStatus: { fieldId: 10 },
  rejectionReason: { fieldId: 11 },
};

const updateVisibility = async () => {
  const status = LFForm.getFieldValues(formFields.requestStatus);
  if (status === 'Rejected') {
    await LFForm.showFields(formFields.rejectionReason);
    await LFForm.validateFields(formFields.rejectionReason, { required: true });
    return;
  }

  await LFForm.hideFields(formFields.rejectionReason);
  await LFForm.validateFields(formFields.rejectionReason, { required: false });
};

LFForm.onFieldChange(updateVisibility, formFields.requestStatus);
updateVisibility().catch(console.warn);
```

## Block Submission with Friendly Validation

```javascript
const formFields = {
  amount: { fieldId: 20 },
  costCenter: { fieldId: 21 },
};

LFForm.onFormSubmission(() => {
  const amount = LFForm.getFieldValues(formFields.amount);
  const costCenter = LFForm.getFieldValues(formFields.costCenter);

  if (amount > 1000 && !costCenter) {
    return { error: 'Cost Center is required when Amount is over 1000.' };
  }
});
```

## Add Table Rows and Populate Values in Order

```javascript
const formFields = {
  expenseTable: { fieldId: 30 },
  expenseItemColumn: { fieldId: 31 },
  expenseAmountColumn: { fieldId: 32 },
};

const fillExpenses = async (rows) => {
  await LFForm.addRow(formFields.expenseTable, rows.length);
  await LFForm.setFieldValues(formFields.expenseItemColumn, rows.map((r) => r.item));
  await LFForm.setFieldValues(formFields.expenseAmountColumn, rows.map((r) => r.amount));
};

fillExpenses([
  { item: 'Hotel', amount: 420 },
  { item: 'Taxi', amount: 52 },
]).catch(console.warn);
```

## Turn Table Entry IDs into Document Links

Sometimes a table already contains Laserfiche entry IDs at form load, and other times those IDs arrive later through a lookup rule. A common requirement is to turn each entry ID into a clickable document link in an adjacent CustomHtml column.

Best practices:
- Prefer `LFForm.onFieldChange()` on the entry ID column instead of `LFForm.onLookupDone()`.
- `onLookupDone()` does not guarantee the target field is already populated.
- Throttle the refresh so multiple row updates collapse into one render pass.
- Build relative URLs when possible. They are more portable across environments.

Relative URL pattern:

```text
/laserfiche/DocView.aspx?repo=r-12345678&customerId=12345678&id=454#?openmode=PDF&lang=en-US
```

Full URL example when needed:

```text
https://app.laserfiche.com/laserfiche/DocView.aspx?repo=r-12345678&customerId=12345678&id=454
```

```javascript
const formFields = {
  entryIdColumn: { fieldId: 70 },
  docLinkColumn: { fieldId: 71 },
};

const docViewBasePath =
  '/laserfiche/DocView.aspx?repo=r-12345678&customerId=12345678&id=';

const throttle = (fn, wait = 150) => {
  let timeoutId = null;
  let pending = false;

  return () => {
    if (timeoutId) {
      pending = true;
      return;
    }

    fn().catch(console.warn);

    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      if (!pending) return;
      pending = false;
      fn().catch(console.warn);
    }, wait);
  };
};

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  return [value];
};

const buildDocLinkHtml = (entryId) => {
  if (!entryId) return '<span class="muted">No document</span>';

  const href = `${docViewBasePath}${encodeURIComponent(entryId)}#?openmode=PDF&lang=en-US`;
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">Open document ${entryId}</a>`;
};

const refreshDocLinks = async () => {
  const entryIds = normalizeToArray(LFForm.getFieldValues(formFields.entryIdColumn));
  const rowHtml = entryIds.map(buildDocLinkHtml);

  await LFForm.changeFieldSettings(formFields.docLinkColumn, {
    content: rowHtml,
  });
};

const refreshDocLinksThrottled = throttle(refreshDocLinks, 200);

LFForm.onFieldChange(refreshDocLinksThrottled, formFields.entryIdColumn);
refreshDocLinks().catch(console.warn);
```

Notes:
- This pattern updates the entire CustomHtml column in one batched pass.
- If the lookup fills several rows quickly, throttling prevents redundant renders.
- If you need different label text, keep the relative URL shape the same and only change the anchor text or query parameters.

## Dynamic Labels by Runtime Context

```javascript
const formFields = {
  approverNotes: { fieldId: 40 },
};

const relabelForStep = async () => {
  const stepName = LFForm.step?.name ?? '';

  if (stepName.includes('Manager')) {
    await LFForm.changeFieldSettings(formFields.approverNotes, { label: 'Manager Notes' });
    return;
  }

  await LFForm.changeFieldSettings(formFields.approverNotes, { label: 'Reviewer Notes' });
};

relabelForStep().catch(console.warn);
```

## Cancel Lookup Calls Conditionally

```javascript
const formFields = {
  lookupMode: { fieldId: 50 },
};

LFForm.onLookupTrigger(() => {
  const mode = LFForm.getFieldValues(formFields.lookupMode);
  if (mode === 'Manual') {
    return { cancelLookup: true };
  }
}, { lookupRuleId: 3 });
```

## Reset a Group of Fields

```javascript
const formFields = {
  line1: { fieldId: 60 },
  line2: { fieldId: 61 },
  postalCode: { fieldId: 62 },
};

const fieldsToReset = [formFields.line1, formFields.line2, formFields.postalCode];

const resetAddress = async () => {
  for (const f of fieldsToReset) {
    await LFForm.setFieldValues(f, '');
  }
};

resetAddress().catch(console.warn);
```

## Localize Labels by LFForm.language

```javascript
const submitLabelByLanguage = {
  en: 'Submit Request',
  fr: 'Soumettre la demande',
  es: 'Enviar solicitud',
};

const localizeButtons = async () => {
  const lang = LFForm.language ?? 'en';
  const label = submitLabelByLanguage[lang] ?? submitLabelByLanguage.en;
  await LFForm.changeActionButton('Submit', { label });
};

localizeButtons().catch(console.warn);
```

## Use TypeScript Types for Safer Helpers

```ts
import type { LFForm, LFFormId, ChangeFormSettingsType } from '@lfz/lf-form-types';

declare const LFForm: LFForm;

const setPageLabels = async (changes: ChangeFormSettingsType) => {
  await LFForm.changeFormSettings(changes);
};

const readValue = (id: LFFormId) => LFForm.getFieldValues(id);
```
