# LFForm Documentation

This package provides typed definitions for the global `LFForm` runtime object used in Laserfiche forms.

For user-first documentation, start with:

- `docs/quick-start.md`
- `docs/api-reference.md`
- `docs/recipes.md`

---

## LFForm Overview

`LFForm` gives JavaScript access to form fields, settings, state, and events.

Core capabilities:

- Read field values with `getFieldValues`
- Write field values with `setFieldValues`
- Change visibility/state (`showFields`, `hideFields`, `disableFields`, `enableFields`)
- Configure fields/form at runtime (`changeFieldSettings`, `changeFormSettings`)
- Work with repeatable structures (`addRow`, `deleteRow`, `addSet`, `deleteSet`)
- Subscribe to field/form/lookup events

Best-practice recommendation:

- Prefer fieldId for identification, especially in tables and collections.
- Do not rely on variableName for table and collection fields.
- Use index with fieldId when targeting a specific row or set.

## Identification Object

Use identification objects anywhere an LFForm API asks for a field target.

```ts
interface LFFormId {
  fieldId?: number;
  variableName?: string;
  variableId?: string;
  trackId?: string;
  index?: number;
}
```

Notes:

- `index` starts at `0` and targets table/collection rows or sets.
- Most APIs accept either a single id object or an array (`LFFormIdParam`).
- For table/collection templates, omitting `index` often applies changes to template + current/future rows.

## Runtime Properties

`LFForm` runtime context:

- `step: { id: string; name: string } | null`
- `stage: { id: string; name: string } | null`
- `language: string | null`
- `locale: string | null`
- `isCloud: boolean`
- `isPreview: boolean`
- `isReadonly: boolean`
- `isDisabled: boolean`
- `isPrint: boolean`
- `isAnonymousUser: boolean`
- `isDraft: boolean`
- `pageURL: string`

## Value Shapes

Common set/get shapes:

- Text-like fields (`SingleLine`, `Email`, `RichText`, `MultiLine`, `Dropdown`): `string`
- Numeric (`Number`, `Currency`): `number`
- Checkbox: `{ value: string[]; otherChoiceValue?: string }`
- Radio: `{ value: string; otherChoiceValue?: string }`
- DateTime: `{ dateStr: string; timeStr?: string }`
- Time: `{ timeStr: string }`
- Address: `{ address1?: string; address2?: string; city?: string; country?: string; province?: string; zipcode?: string }`
- Geolocation: `{ latitude: number; longitude: number }`

Unsupported value APIs for direct set/get:

- `Collection`
- `Table`
- `FileUpload`
- `Fileset`

## Best Practice Pattern

Use async business logic and await mutating LFForm calls.

```javascript
const formFields = {
  firstName: { fieldId: 10 },
  lastName: { fieldId: 11 },
  fullName: { fieldId: 12 },
};

const setFullName = async () => {
  const first = LFForm.getFieldValues(formFields.firstName);
  const last = LFForm.getFieldValues(formFields.lastName);

  if (!first || !last) return;
  await LFForm.setFieldValues(formFields.fullName, `${last}, ${first}`);
};

LFForm.onFieldChange(setFullName, formFields.firstName);
LFForm.onFieldChange(setFullName, formFields.lastName);

const main = async () => {
  if (LFForm.isReadonly || LFForm.isDisabled || LFForm.isPrint) return;
  await setFullName();
};

main().catch(console.warn);
```

## Method Groups

See `docs/api-reference.md` for exact signatures and options.

- Field values: `getFieldValues`, `setFieldValues`
- Visibility/state: `showFields`, `hideFields`, `disableFields`, `enableFields`
- Settings: `changeFieldSettings`, `changeFormSettings`, `changeFieldOptions`
- Buttons: `changeActionButton`, `changeActionButtons`
- Repeatables: `addRow`, `addSet`, `deleteRow`, `deleteSet`
- Classes: `addCSSClasses`, `removeCSSClasses`
- Search/find: `findFields`, `findFieldsByClassName`, `findFieldsByFieldId`, `findFieldsByVariableName`, `findFieldsByVariableId`
- Events: `subscribe`, `unsubscribe`, `onFormSubmission`, `onFieldChange`, `onFieldBlur`, `onLookupTrigger`, `onLookupDone`
- Validation: `validateFields`

## Package Imports

Use canonical package names:

```ts
import type {
  LFForm,
  LFFormId,
  LFFormIdParam,
  ChangeFormSettingsType,
  ActionButtonDefault,
  GeolocationField,
} from '@lfz/lf-form-types';
```
