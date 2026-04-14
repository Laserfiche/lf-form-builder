[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / DocViewOptions

# Type Alias: DocViewOptions

> **DocViewOptions** = `Required`\<`Omit`\<[`DefaultRepositoryAPIOptions`](DefaultRepositoryAPIOptions.md)\<[`IframeOptions`](IframeOptions.md) & `object`\>, `"apiClient"`\>\>

Defined in: [packages/core/src/components/repository/docView.ts:14](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/repository/docView.ts#L14)

DocViewOptions is the options object that is passed to the DocView constructor.

## Param

The LFFormField or LFFormId of the Custom HTML field that will be used to render the DocView iframe.

## Param

The hostname of the Laserfiche repository. Defaults to 'app.laserfiche.com'.

## Param

The mode of the iframe. Can be 'embed' or 'mobile'.

## Param

A callback function that is called when the DocView iframe is loaded.
