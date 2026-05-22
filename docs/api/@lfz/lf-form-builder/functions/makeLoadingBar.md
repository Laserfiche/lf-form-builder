[Documentation](../../../index.md) / [@lf/lf-form-builder](../index.md) / [](../README.md) / makeLoadingBar

# Function: makeLoadingBar()

> **makeLoadingBar**(`curPrecent`, `loadingBarOptions?`): `string`

Defined in: [packages/core/src/components/makeLoadingBar.ts:23](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/makeLoadingBar.ts#L23)

## Parameters

### curPrecent

`number`

### loadingBarOptions?

[`LoadingBarOptions`](../type-aliases/LoadingBarOptions.md)

## Returns

`string`

## Example

```js
const customHtmlFieldId = { fieldId: 10 };
await LFForm.changeFieldSettings(customHtmlFieldId, {
    content: makeLoadingBar(50, { height: 200 })
});
```
