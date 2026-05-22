[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormProperties

# Type Alias: LFFormProperties

> **LFFormProperties** = `object`

Defined in: [LFForm/properties.ts:16](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L16)

Runtime context and metadata properties available on the LFForm object.

## Remarks

Gate mutations when [isReadonly](#isreadonly),
[isDisabled](#isdisabled), or
[isPrint](#isprint) is `true`.
Branch behavior by step, stage, or language as needed.

## Properties

### step

> **step**: [`LFFormStepState`](LFFormStepState.md)

Defined in: [LFForm/properties.ts:18](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L18)

Current workflow step, or `null` if no step is active.

***

### stage

> **stage**: [`LFFormStepState`](LFFormStepState.md)

Defined in: [LFForm/properties.ts:20](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L20)

Current workflow stage, or `null` if no stage is active.

***

### language

> **language**: `string` \| `null`

Defined in: [LFForm/properties.ts:22](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L22)

Current form language (e.g. `"en"`), or `null` if unset.

***

### locale

> **locale**: `string` \| `null`

Defined in: [LFForm/properties.ts:24](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L24)

Current form locale (e.g. `"en-US"`), or `null` if unset.

***

### isCloud

> **isCloud**: `boolean`

Defined in: [LFForm/properties.ts:26](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L26)

`true` when the form is running in Laserfiche Cloud.

***

### isPreview

> **isPreview**: `boolean`

Defined in: [LFForm/properties.ts:28](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L28)

`true` when the form is in preview mode.

***

### isReadonly

> **isReadonly**: `boolean`

Defined in: [LFForm/properties.ts:30](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L30)

`true` when the form is read-only. Mutations should be gated on this flag.

***

### isDisabled

> **isDisabled**: `boolean`

Defined in: [LFForm/properties.ts:32](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L32)

`true` when the form is disabled. Mutations should be gated on this flag.

***

### isPrint

> **isPrint**: `boolean`

Defined in: [LFForm/properties.ts:34](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L34)

`true` when the form is in print mode. Mutations should be gated on this flag.

***

### isAnonymousUser

> **isAnonymousUser**: `boolean`

Defined in: [LFForm/properties.ts:36](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L36)

`true` when the current user is anonymous (public submission).

***

### isDraft

> **isDraft**: `boolean`

Defined in: [LFForm/properties.ts:38](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L38)

`true` when the form is a saved draft.

***

### pageURL

> **pageURL**: `string`

Defined in: [LFForm/properties.ts:40](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/properties.ts#L40)

Full URL of the current form page.
