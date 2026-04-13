---
title: Show/Hide Fields from Dropdown Selection
description: Toggle field visibility and validation based on a dropdown value.
category: visibility
---

# Show/Hide Fields from Dropdown Selection

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
