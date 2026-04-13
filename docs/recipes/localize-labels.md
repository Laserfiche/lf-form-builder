---
title: Localize Labels by Language
description: Translate action button labels using LFForm.language.
category: localization
---

# Localize Labels by LFForm.language

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
