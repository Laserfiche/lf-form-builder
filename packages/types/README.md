# @lf/lf-form-types

TypeScript type definitions for the Laserfiche Forms `LFForm` runtime API.

## Installation

```bash
npm install @lf/lf-form-types
```

## Usage

```typescript
import type { LFForm, LFFormField, LFFormId, LFFormIdParam } from '@lf/lf-form-types';
```

### LFForm-first imports

Use focused subpaths when you want the API surface to match LFForm behavior domains.

```typescript
import type { LFForm, LFFormGetterApi, LFFormMethodApi, LFFormEventApi } from '@lf/lf-form-types/lfform';
import type { LFFormSupportedEvents, LFFormEventPayloadMap } from '@lf/lf-form-types/events';
import type { LFFormGetFieldValues, LFFormIdParam } from '@lf/lf-form-types/getters';
import type { LFFormSetFieldValues, LFFormPromiseResponse } from '@lf/lf-form-types/methods';
import type { LFFormField, BaseFieldSettings } from '@lf/lf-form-types/fields';
import { isLfFormId } from '@lf/lf-form-types/utils';
```

### Main API vs auxiliary types

The docs are organized in two tiers:

- **Main LFForm API** — `LFForm`, `LFFormEventApi`, `LFFormGetterApi`, `LFFormMethodApi`
- **Auxiliary types** — identifiers, event payloads, field/settings unions, and runtime helpers grouped by use

Use the main API pages when you want a guided overview of the LFForm runtime surface, then move into the supporting type groups for exact payload and settings details.

## Documentation

- [LFForm Quick Start](../../docs/guide/quick-start.md)
- [LFForm API Navigation](../../docs/guide/lfform-api-navigation.md)
- [Template & Toolchain Setup](../../docs/guide/template-setup.md)
- [Custom HTML & Sandbox](../../docs/guide/custom-html.md)
- [Recipes](../../docs/recipes/index.md)
- [Generated API Reference](../../docs/api/index.md)

## What's included

### Core types

- **`LFForm`** — Full interface for the `LFForm` global (getFieldValues, setFieldValues, findFields, changeFieldSettings, subscribe, etc.)
- **`LFFormEventApi`** / **`LFFormGetterApi`** / **`LFFormMethodApi`** — The core LFForm behavior domains surfaced as separate main API pages
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

[MIT](../../LICENSE)
