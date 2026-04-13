---
title: Block Submission with Friendly Validation
description: Conditionally prevent form submission with a user-friendly error message.
category: validation
---

# Block Submission with Friendly Validation

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
