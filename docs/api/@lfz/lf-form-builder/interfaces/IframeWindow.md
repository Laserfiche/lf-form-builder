[Documentation](../../../index.md) / [@lf/lf-form-builder](../index.md) / [](../README.md) / IframeWindow

# Interface: IframeWindow

Defined in: [packages/core/src/components/repository/iframe.ts:8](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/iframe.ts#L8)

DocViewWindow is a global interface that is used to communicate with the DocView iframe.
Extend this interface to add new methods that can be called in conjunction with the DocView iframe.

## Extends

- `Window`

## Indexable

> \[`index`: `number`\]: `Window`

## Properties

### LFForm

> **LFForm**: [`LFForm`](../../lf-form-types/index/type-aliases/LFForm.md)

Defined in: [packages/core/src/global.d.ts:5](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/global.d.ts#L5)

#### Inherited from

`Window.LFForm`

***

### onIframeLoad

> **onIframeLoad**: (`fieldId`) => `void`

Defined in: [packages/core/src/components/repository/iframe.ts:9](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/iframe.ts#L9)

#### Parameters

##### fieldId

`number`

#### Returns

`void`
