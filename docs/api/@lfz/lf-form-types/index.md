[Documentation](../../index.md) / @lfz/lf-form-types

# @lfz/lf-form-types

TypeScript type definitions for the Laserfiche Forms `LFForm` runtime API.

## Installation

```bash
npm install @lfz/lf-form-types
```

## Usage

```typescript
import type { LFForm, LFFormField, LFFormId, LFFormIdParam } from '@lfz/lf-form-types';
```

### LFForm-first imports

Use focused subpaths when you want the API surface to match LFForm behavior domains.

```typescript
import type { LFForm, LFFormGetterApi, LFFormMethodApi, LFFormEventApi } from '@lfz/lf-form-types/lfform';
import type { LFFormSupportedEvents, LFFormEventPayloadMap } from '@lfz/lf-form-types/events';
import type { LFFormGetFieldValues, LFFormIdParam } from '@lfz/lf-form-types/getters';
import type { LFFormSetFieldValues, LFFormPromiseResponse } from '@lfz/lf-form-types/methods';
import type { LFFormField, BaseFieldSettings } from '@lfz/lf-form-types/fields';
import { isLfFormId } from '@lfz/lf-form-types/utils';
```

## Documentation

- Quick start: `docs/quick-start.md`
- API reference: `docs/api-reference.md`
- Custom HTML and sandbox integration: `docs/custom-html-sandbox.md`
- Recipes: `docs/recipes.md`

## What's included

### Core types

- **`LFForm`** — Full interface for the `LFForm` global (getFieldValues, setFieldValues, findFields, changeFieldSettings, subscribe, etc.)
- **`LFFormField`** — Union of all field component types (TextField, NumberField, DateField, AddressField, CheckboxField, RadioField, DropdownField, TableField, CollectionField, etc.)
- **`LFFormId`** / **`LFFormIdParam`** — Field identifiers (by fieldId, variableId, or variableName)

### Field settings

- **`BaseFieldSettings`**, **`StandardFieldSettings`**, **`AddressFieldSettings`**, **`TableFieldSettings`**, **`CollectionFieldSettings`**, etc.

### Event types

- **`LFFormSupportedEvents`** — `fieldChange`, `fieldBlur`, `formSubmission`, `lookupTrigger`, `lookupDone`
- **`LFFormEventHandler`** — Event handler signature
- **`LFFormEventOptions`** — Per-event option types

### Helpers

- **`isLfFormId()`** — Runtime type guard for `LFFormId`

## License

[MIT](../../_media/LICENSE)

## Modules

- [index](index/index.md)
