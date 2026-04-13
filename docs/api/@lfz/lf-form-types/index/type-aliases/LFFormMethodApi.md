[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormMethodApi

# Type Alias: LFFormMethodApi\<FieldType\>

> **LFFormMethodApi**\<`FieldType`\> = `object`

Defined in: LFForm/methods.ts:110

Mutating APIs for setting values, changing settings, toggling visibility, and more.

## Remarks

All mutating methods return `Promise<LFFormPromiseResponse>` unless noted otherwise.
Await these calls to ensure changes are applied before continuing.

## Type Parameters

### FieldType

`FieldType` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

## Properties

### setFieldValues

> **setFieldValues**: [`LFFormSetFieldValues`](LFFormSetFieldValues.md)

Defined in: LFForm/methods.ts:113

Sets field values for one or more matching fields.

***

### changeFieldSettings

> **changeFieldSettings**: \<`FieldSettingType`\>(`id`, `changes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:128

Changes settings on target fields. Template-aware for table/collection fields.

#### Type Parameters

##### FieldSettingType

`FieldSettingType` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = `FieldType`

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### changes

[`LFFormChangeFieldSettingsType`](LFFormChangeFieldSettingsType.md)\<[`ComponentTypes`](ComponentTypes.md)\[[`LFFormResolvedFieldRef`](LFFormResolvedFieldRef.md)\<`FieldSettingType`\>\[`"componentType"`\]\]\>

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.changeFieldSettings({ fieldId: 10 }, {
  label: 'Given Name',
  description: 'Use your legal first name',
  placeholder: 'John',
  tooltip: 'As shown on your ID',
});
```

***

### changeFieldOptions

> **changeFieldOptions**: (`id`, `changes`, `mode?`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:142

Adds, removes, or replaces options on dropdown, radio, or checkbox fields.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

Target field(s).

##### changes

`object`[]

Array of option objects with `label`, `value`, and optional `selected`.

##### mode?

`"add"` \| `"remove"` \| `"replace"`

`'add'` (default), `'remove'`, or `'replace'`.

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### changeFormSettings

> **changeFormSettings**: (`changes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:160

Changes form-level settings (title, description, browser title, pagination).

#### Parameters

##### changes

[`LFFormChangeFormSettings`](LFFormChangeFormSettings.md)

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.changeFormSettings({
  title: 'Expense Report',
  browserTitle: 'Expense Report | Internal',
  description: 'Complete all required fields.',
});
```

***

### disableFields

> **disableFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:172

Disables target fields. Template-aware for table/collection fields.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.disableFields({ fieldId: 70 });
```

***

### enableFields

> **enableFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:185

Enables target fields. Template-aware for table/collection fields.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.enableFields({ fieldId: 70 });
```

***

### showFields

> **showFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:198

Shows target fields. Template-aware for table/collection fields.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.showFields({ fieldId: 70 });
```

***

### hideFields

> **hideFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:211

Hides target fields. Template-aware for table/collection fields.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.hideFields([{ fieldId: 3, index: 1 }, { fieldId: 3, index: 3 }]);
```

***

### addRow

> **addRow**: (`id`, `count`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:227

Adds rows to a table field.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

Table field target.

##### count

`number`

Number of rows to add.

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.addRow({ fieldId: 30 }, 3);
```

***

### addSet

> **addSet**: (`id`, `count`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:243

Adds sets to a collection field.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

Collection field target.

##### count

`number`

Number of sets to add.

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.addSet({ fieldId: 90 }, 2);
```

***

### deleteRow

> **deleteRow**: (`id`, ...`index`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:259

Deletes specific rows from a table field by index.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

Table field target.

##### index

...`number`[]

One or more 0-based row indexes to delete.

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.deleteRow({ fieldId: 30 }, 0);
```

***

### deleteSet

> **deleteSet**: (`id`, ...`index`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:275

Deletes specific sets from a collection field by index.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

Collection field target.

##### index

...`number`[]

One or more 0-based set indexes to delete.

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.deleteSet({ fieldId: 90 }, 0, 1);
```

***

### addCSSClasses

> **addCSSClasses**: (`id`, `classes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:288

Adds CSS classes to target fields. Existing classes are not duplicated.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### classes

`string` \| `string`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.addCSSClasses({ fieldId: 100 }, 'highlight urgent');
```

***

### removeCSSClasses

> **removeCSSClasses**: (`id`, `classes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:301

Removes CSS classes from target fields. Removing a non-existent class is a no-op.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### classes

`string` \| `string`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.removeCSSClasses({ fieldId: 100 }, ['urgent']);
```

***

### getLaserficheAPIClient

> **getLaserficheAPIClient**: \<`T`\>(`client`) => `Promise`\<`T`\>

Defined in: LFForm/methods.ts:307

Returns a Laserfiche API client instance by name.

#### Type Parameters

##### T

`T`

#### Parameters

##### client

`string`

#### Returns

`Promise`\<`T`\>

***

### changeActionButton

> **changeActionButton**: (`buttonName`, `actionButtonInfo`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:320

Changes the label for a single action button.

#### Parameters

##### buttonName

[`LFFormActionButtonDefault`](LFFormActionButtonDefault.md) \| `string`

A default action (`'Submit'`, `'Approve'`, etc.) or custom action class.

##### actionButtonInfo

Object with the new `label`.

###### label

`string`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.changeActionButton('Submit', { label: 'Send Request' });
```

***

### changeActionButtons

> **changeActionButtons**: (`actionButtonsToChange`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:337

Changes labels for multiple action buttons at once.

#### Parameters

##### actionButtonsToChange

`object`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.changeActionButtons([
  { action: 'Approve', label: 'Approve Request' },
  { action: 'Reject', label: 'Reject Request' },
  { action: 'SaveAsDraft', label: 'Save Draft' },
]);
```

***

### validateFields

> **validateFields**: (`id`, `validationOptions`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:352

Adds or removes validation settings on target fields.

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### validationOptions

###### required

`boolean`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

#### Example

```javascript
await LFForm.validateFields({ fieldId: 110 }, { required: true });
```
