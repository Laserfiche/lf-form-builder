---
title: Reset a Group of Fields
description: Clear multiple fields to empty values in a single operation.
category: fields
---

# Reset a Group of Fields

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
