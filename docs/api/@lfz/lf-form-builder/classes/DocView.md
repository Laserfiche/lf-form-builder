[Documentation](../../../index.md) / [@lf/lf-form-builder](../index.md) / [](../README.md) / DocView

# Class: DocView

Defined in: [packages/core/src/components/repository/docView.ts:25](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/docView.ts#L25)

## Extends

- [`IframeView`](IframeView.md)

## Constructors

### Constructor

> **new DocView**(`docViewOptions`): `DocView`

Defined in: [packages/core/src/components/repository/docView.ts:45](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/docView.ts#L45)

The DocView class constructs an object that is used to render a DocView iframe in a Custom HTML field.
You must call the render method to render the DocView iframe.

#### Parameters

##### docViewOptions

[`DocViewOptions`](../type-aliases/DocViewOptions.md)

The options object that is passed to the DocView constructor.

#### Returns

`DocView`

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

#### Overrides

[`IframeView`](IframeView.md).[`constructor`](IframeView.md#constructor)

## Properties

### key?

> `optional` **key?**: `string`

Defined in: [packages/core/src/components/repository/iframe.ts:25](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/iframe.ts#L25)

#### Inherited from

[`IframeView`](IframeView.md).[`key`](IframeView.md#key)

## Methods

### changeOptions()

> **changeOptions**(`options`): `void`

Defined in: [packages/core/src/components/repository/iframe.ts:102](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/iframe.ts#L102)

#### Parameters

##### options

`Partial`\<[`IframeOptions`](../type-aliases/IframeOptions.md)\>

#### Returns

`void`

#### Inherited from

[`IframeView`](IframeView.md).[`changeOptions`](IframeView.md#changeoptions)

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Defined in: [packages/core/src/components/repository/iframe.ts:109](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/iframe.ts#L109)

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`IframeView`](IframeView.md).[`destroy`](IframeView.md#destroy)

***

### generateHTML()

> **generateHTML**(`frameUrl`, `onloadString?`): `string`

Defined in: [packages/core/src/components/repository/iframe.ts:89](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/iframe.ts#L89)

#### Parameters

##### frameUrl

`string`

##### onloadString?

`string`

#### Returns

`string`

#### Inherited from

[`IframeView`](IframeView.md).[`generateHTML`](IframeView.md#generatehtml)

***

### render()

> **render**(): `Promise`\<`void`\>

Defined in: [packages/core/src/components/repository/docView.ts:49](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/docView.ts#L49)

The render method is used to render the DocView iframe in the Custom HTML field.

#### Returns

`Promise`\<`void`\>

#### Preserve

docs

#### Overrides

[`IframeView`](IframeView.md).[`render`](IframeView.md#render)
