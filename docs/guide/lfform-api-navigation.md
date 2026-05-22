# LFForm API Navigation

Use this page as a quick routing map when browsing the generated `@lf/lf-form-types` reference.

The API reference is organized in two tiers:

- **Main LFForm API**: linear pages intended for next/previous navigation.
- **Auxiliary Types**: grouped reference pages for payloads, identifiers, settings, and helpers.

## Start Here

- [LFForm main type](/api/@lf/lf-form-types/index/type-aliases/LFForm.md): composed runtime API surface.
- [LFForm ID model](/api/@lf/lf-form-types/index/type-aliases/LFFormId.md): targeting fields and repeatable indexes.

## Event Workflows

- [LFFormEventApi](/api/@lf/lf-form-types/index/type-aliases/LFFormEventApi.md): all event entry methods.
- [LFFormSupportedEvents](/api/@lf/lf-form-types/index/type-aliases/LFFormSupportedEvents.md): canonical event names.
- [LFFormEventPayloadMap](/api/@lf/lf-form-types/index/type-aliases/LFFormEventPayloadMap.md): payload by event.

## Getter Workflows

- [LFFormGetterApi](/api/@lf/lf-form-types/index/type-aliases/LFFormGetterApi.md): find/get APIs.
- [LFFormGetFieldValues](/api/@lf/lf-form-types/index/type-aliases/LFFormGetFieldValues.md): return typing rules.
- [LFFormFindFieldsBy](/api/@lf/lf-form-types/index/type-aliases/LFFormFindFieldsBy.md): reusable finder shape.

## Method Workflows

- [LFFormMethodApi](/api/@lf/lf-form-types/index/type-aliases/LFFormMethodApi.md): mutating methods.
- [LFFormSetFieldValues](/api/@lf/lf-form-types/index/type-aliases/LFFormSetFieldValues.md): write semantics.
- [LFFormPromiseResponse](/api/@lf/lf-form-types/index/type-aliases/LFFormPromiseResponse.md): success/error contract.

## Helper Type Catalog

- [Field Types](/api/@lf/lf-form-types/index/type-aliases/LFFormField.md): union for all field components.
- [Field Settings](/api/@lf/lf-form-types/index/type-aliases/BaseFieldSettings.md): shared and specialized setting types.
- [Form Settings](/api/@lf/lf-form-types/index/type-aliases/LFFormChangeFormSettings.md): form-level settings updates.
- [Utilities](/api/@lf/lf-form-types/index/functions/isLfFormId.md): runtime type guards.

## Import Paths That Match These Sections

```ts
import type { LFForm, LFFormEventApi, LFFormGetterApi, LFFormMethodApi } from '@lf/lf-form-types/lfform';
import type { LFFormSupportedEvents, LFFormEventPayloadMap } from '@lf/lf-form-types/events';
import type { LFFormGetFieldValues } from '@lf/lf-form-types/getters';
import type { LFFormSetFieldValues } from '@lf/lf-form-types/methods';
import type { LFFormField, BaseFieldSettings } from '@lf/lf-form-types/fields';
import { isLfFormId } from '@lf/lf-form-types/utils';
```