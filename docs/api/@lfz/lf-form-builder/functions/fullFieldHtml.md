[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / fullFieldHtml

# Function: fullFieldHtml()

> **fullFieldHtml**(`formField`, `placement`, `content`, `options?`): `Promise`\<`void`\>

Defined in: [packages/core/src/components/fullFieldHtml.ts:41](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/core/src/components/fullFieldHtml.ts#L41)

Automatically sets a full field HTML content above or below the field.
Passes the content embedded in a div with absolute positioning.

## Parameters

### formField

[`LFFormField`](../../lf-form-types/index/type-aliases/LFFormField.md) \| [`LFFormId`](../../lf-form-types/index/type-aliases/LFFormId.md)

### placement

`"content"` \| `"textAbove"` \| `"textBelow"` \| `"description"` \| `"subtext"`

### content

`string` \| `null`

### options?

[`FullFieldHtmlOptions`](../type-aliases/FullFieldHtmlOptions.md) = `{}`

## Returns

`Promise`\<`void`\>

## Preserve

docs
