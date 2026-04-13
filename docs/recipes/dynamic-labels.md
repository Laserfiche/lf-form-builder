---
title: Dynamic Labels by Runtime Context
description: Change field labels dynamically based on the current workflow step.
category: settings
---

# Dynamic Labels by Runtime Context

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
