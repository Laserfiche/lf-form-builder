---
title: Cancel Lookup Calls Conditionally
description: Block a lookup rule from firing based on the current field state.
category: lookups
---

# Cancel Lookup Calls Conditionally

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
