[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / makeLoadingBar

# Function: makeLoadingBar()

> **makeLoadingBar**(`curPrecent`, `loadingBarOptions?`): `string`

Defined in: packages/core/src/components/makeLoadingBar.ts:23

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
