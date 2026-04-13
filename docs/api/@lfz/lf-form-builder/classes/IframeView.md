[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / IframeView

# Class: IframeView

Defined in: packages/core/src/components/repository/iframe.ts:21

## Extended by

- [`DocView`](DocView.md)

## Constructors

### Constructor

> **new IframeView**(`iframeOptions`): `IframeView`

Defined in: packages/core/src/components/repository/iframe.ts:45

The DocView class constructs an object that is used to render a DocView iframe in a Custom HTML field.
You must call the render method to render the DocView iframe.

#### Parameters

##### iframeOptions

[`IframeOptions`](../type-aliases/IframeOptions.md)

The options object that is passed to the DocView constructor.

#### Returns

`IframeView`

#### Preserve

docs

#### Example

```javascript
const docView = new DocView({
  entryIdField: { variableName: 'Entry_ID' },
  repositoryId: 'r-123456',
  options: {
    customHtmlField: { fieldId: 27 },
    hostname: 'app.laserfiche.com',
    iframeMode: 'embed',
    onload: () => console.log('loaded'),
  }
});
await docView.render();

## Properties

### key?

> `optional` **key?**: `string`

Defined in: packages/core/src/components/repository/iframe.ts:25

## Methods

### changeOptions()

> **changeOptions**(`options`): `void`

Defined in: packages/core/src/components/repository/iframe.ts:102

#### Parameters

##### options

`Partial`\<[`IframeOptions`](../type-aliases/IframeOptions.md)\>

#### Returns

`void`

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: packages/core/src/components/repository/iframe.ts:109

#### Returns

`Promise`\<`void`\>

***

### generateHTML()

> **generateHTML**(`frameUrl`, `onloadString?`): `string`

Defined in: packages/core/src/components/repository/iframe.ts:89

#### Parameters

##### frameUrl

`string`

##### onloadString?

`string`

#### Returns

`string`

***

### render()

> **render**(`frameUrl`): `Promise`\<`void`\>

Defined in: packages/core/src/components/repository/iframe.ts:72

The render method is used to render the DocView iframe in the Custom HTML field.

#### Parameters

##### frameUrl

`string`

#### Returns

`Promise`\<`void`\>

#### Preserve

docs
