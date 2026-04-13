---
title: Use TypeScript Types for Safer Helpers
description: Leverage @lfz/lf-form-types for type-safe utility functions.
category: typescript
---

# Use TypeScript Types for Safer Helpers

```ts
import type { LFForm, LFFormId, LFFormChangeFormSettings } from '@lfz/lf-form-types';

declare const LFForm: LFForm;

const setPageLabels = async (changes: LFFormChangeFormSettings) => {
  await LFForm.changeFormSettings(changes);
};

const readValue = (id: LFFormId) => LFForm.getFieldValues(id);
```
