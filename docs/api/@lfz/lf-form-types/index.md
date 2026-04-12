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

## Documentation

- Package reference: `packages/types/DOCS.md`
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

## Interfaces

- [LFFormFindFieldsBy](interfaces/LFFormFindFieldsBy.md)

## Type Aliases

- [AddressField](type-aliases/AddressField.md)
- [AddressFieldSettings](type-aliases/AddressFieldSettings.md)
- [AddressFieldValue](type-aliases/AddressFieldValue.md)
- [AllFieldValueTypes](type-aliases/AllFieldValueTypes.md)
- [AllLFFormTypes](type-aliases/AllLFFormTypes.md)
- [BaseFieldSettings](type-aliases/BaseFieldSettings.md)
- [CheckboxField](type-aliases/CheckboxField.md)
- [CollectionField](type-aliases/CollectionField.md)
- [CollectionFieldSettings](type-aliases/CollectionFieldSettings.md)
- [ComponentTypes](type-aliases/ComponentTypes.md)
- [CustomHtmlField](type-aliases/CustomHtmlField.md)
- [CustomHtmlFieldSettings](type-aliases/CustomHtmlFieldSettings.md)
- [DateField](type-aliases/DateField.md)
- [DateTimeFieldValue](type-aliases/DateTimeFieldValue.md)
- [DropdownField](type-aliases/DropdownField.md)
- [FileUploadField](type-aliases/FileUploadField.md)
- [FileUploadFieldSettings](type-aliases/FileUploadFieldSettings.md)
- [GeolocationField](type-aliases/GeolocationField.md)
- [GeolocationFieldValue](type-aliases/GeolocationFieldValue.md)
- [LFForm](type-aliases/LFForm.md)
- [LFFormActionButtonDefault](type-aliases/LFFormActionButtonDefault.md)
- [LFFormCanonicalEventName](type-aliases/LFFormCanonicalEventName.md)
- [LFFormChangeFieldSettingsType](type-aliases/LFFormChangeFieldSettingsType.md)
- [LFFormChangeFormSettings](type-aliases/LFFormChangeFormSettings.md)
- [LFFormEventApi](type-aliases/LFFormEventApi.md)
- [LFFormEventHandler](type-aliases/LFFormEventHandler.md)
- [LFFormEventOptions](type-aliases/LFFormEventOptions.md)
- [LFFormEventParam](type-aliases/LFFormEventParam.md)
- [LFFormEventParamOption](type-aliases/LFFormEventParamOption.md)
- [LFFormEventPayloadMap](type-aliases/LFFormEventPayloadMap.md)
- [LFFormEventReturnMap](type-aliases/LFFormEventReturnMap.md)
- [LFFormEventSubscribeOptions](type-aliases/LFFormEventSubscribeOptions.md)
- [LFFormField](type-aliases/LFFormField.md)
- [LFFormFieldEventName](type-aliases/LFFormFieldEventName.md)
- [LFFormFieldRef](type-aliases/LFFormFieldRef.md)
- [LFFormFieldValueType](type-aliases/LFFormFieldValueType.md)
- [LFFormFormPart](type-aliases/LFFormFormPart.md)
- [LFFormGetFieldValues](type-aliases/LFFormGetFieldValues.md)
- [LFFormGetterApi](type-aliases/LFFormGetterApi.md)
- [LFFormId](type-aliases/LFFormId.md)
- [LFFormIdParam](type-aliases/LFFormIdParam.md)
- [LFFormLookupEventName](type-aliases/LFFormLookupEventName.md)
- [LFFormLookupId](type-aliases/LFFormLookupId.md)
- [LFFormMethodApi](type-aliases/LFFormMethodApi.md)
- [LFFormPagePart](type-aliases/LFFormPagePart.md)
- [LFFormPart](type-aliases/LFFormPart.md)
- [LFFormPromiseResponse](type-aliases/LFFormPromiseResponse.md)
- [LFFormResolvedFieldRef](type-aliases/LFFormResolvedFieldRef.md)
- [LFFormSetFieldValues](type-aliases/LFFormSetFieldValues.md)
- [LFFormSetFieldValueType](type-aliases/LFFormSetFieldValueType.md)
- [LFFormSubmissionEventName](type-aliases/LFFormSubmissionEventName.md)
- [LFFormSubmissionEventParam](type-aliases/LFFormSubmissionEventParam.md)
- [LFFormSupportedEvents](type-aliases/LFFormSupportedEvents.md)
- [LFFormTypedEventHandler](type-aliases/LFFormTypedEventHandler.md)
- [MultiOptionFieldValue](type-aliases/MultiOptionFieldValue.md)
- [NumberField](type-aliases/NumberField.md)
- [NumberLineFieldValue](type-aliases/NumberLineFieldValue.md)
- [PaginationFieldSettings](type-aliases/PaginationFieldSettings.md)
- [RadioField](type-aliases/RadioField.md)
- [SectionField](type-aliases/SectionField.md)
- [SignatureField](type-aliases/SignatureField.md)
- [SignatureFieldSettings](type-aliases/SignatureFieldSettings.md)
- [SingleLineFieldValue](type-aliases/SingleLineFieldValue.md)
- [SingleOptionFieldValue](type-aliases/SingleOptionFieldValue.md)
- [StandardFieldSettings](type-aliases/StandardFieldSettings.md)
- [TableField](type-aliases/TableField.md)
- [TableFieldSettings](type-aliases/TableFieldSettings.md)
- [TextField](type-aliases/TextField.md)
- [TimeField](type-aliases/TimeField.md)
- [TimeFieldValue](type-aliases/TimeFieldValue.md)
