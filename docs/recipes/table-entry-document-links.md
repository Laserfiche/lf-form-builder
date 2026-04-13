---
title: Turn Entry IDs into Document Links
description: Render clickable Laserfiche document links in a CustomHtml table column from entry IDs.
category: tables
---

# Turn Table Entry IDs into Document Links

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
