[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFFormMethodApi

# Type Alias: LFFormMethodApi\<FieldType\>

> **LFFormMethodApi**\<`FieldType`\> = `object`

Defined in: LFForm/methods.ts:53

## Type Parameters

### FieldType

`FieldType` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

## Properties

### addCSSClasses

> **addCSSClasses**: (`id`, `classes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:102

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### classes

`string` \| `string`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### addRow

> **addRow**: (`id`, `count`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:86

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### count

`number`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### addSet

> **addSet**: (`id`, `count`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:90

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### count

`number`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### changeActionButton

> **changeActionButton**: (`buttonName`, `actionButtonInfo`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:111

#### Parameters

##### buttonName

[`LFFormActionButtonDefault`](LFFormActionButtonDefault.md) \| `string`

##### actionButtonInfo

###### label

`string`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### changeActionButtons

> **changeActionButtons**: (`actionButtonsToChange`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:115

#### Parameters

##### actionButtonsToChange

`object`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### changeFieldOptions

> **changeFieldOptions**: (`id`, `changes`, `mode?`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:62

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### changes

`object`[]

##### mode?

`"add"` \| `"remove"` \| `"replace"`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### changeFieldSettings

> **changeFieldSettings**: \<`FieldSettingType`\>(`id`, `changes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:56

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

***

### changeFormSettings

> **changeFormSettings**: (`changes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:67

#### Parameters

##### changes

[`LFFormChangeFormSettings`](LFFormChangeFormSettings.md)

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### deleteRow

> **deleteRow**: (`id`, ...`index`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:94

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### index

...`number`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### deleteSet

> **deleteSet**: (`id`, ...`index`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:98

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### index

...`number`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### disableFields

> **disableFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:70

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### enableFields

> **enableFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:74

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### getLaserficheAPIClient

> **getLaserficheAPIClient**: \<`T`\>(`client`) => `Promise`\<`T`\>

Defined in: LFForm/methods.ts:110

#### Type Parameters

##### T

`T`

#### Parameters

##### client

`string`

#### Returns

`Promise`\<`T`\>

***

### hideFields

> **hideFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:82

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### removeCSSClasses

> **removeCSSClasses**: (`id`, `classes`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:106

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### classes

`string` \| `string`[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### setFieldValues

> **setFieldValues**: [`LFFormSetFieldValues`](LFFormSetFieldValues.md)

Defined in: LFForm/methods.ts:55

***

### showFields

> **showFields**: (`id`, ...`ids`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:78

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### ids

...[`LFFormId`](LFFormId.md)[]

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

***

### validateFields

> **validateFields**: (`id`, `validationOptions`) => `Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>

Defined in: LFForm/methods.ts:121

#### Parameters

##### id

[`LFFormIdParam`](LFFormIdParam.md)

##### validationOptions

###### required

`boolean`

#### Returns

`Promise`\<[`LFFormPromiseResponse`](LFFormPromiseResponse.md)\>
