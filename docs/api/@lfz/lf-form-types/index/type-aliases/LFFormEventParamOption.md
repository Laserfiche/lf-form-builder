[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormEventParamOption

# Type Alias: LFFormEventParamOption

> **LFFormEventParamOption** = `object`

Defined in: [LFForm/events.ts:17](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L17)

Options for event subscription handlers including targeting and naming.

## Properties

### handlerName?

> `optional` **handlerName?**: `string`

Defined in: [LFForm/events.ts:19](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L19)

Unique name for this handler, used for later unsubscription.

***

### cannotUnsubscribe?

> `optional` **cannotUnsubscribe?**: `boolean`

Defined in: [LFForm/events.ts:21](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L21)

When `true`, prevents this handler from being unsubscribed.

***

### fieldId?

> `optional` **fieldId?**: `number`

Defined in: [LFForm/events.ts:23](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L23)

Target field by numeric `fieldId`.

***

### variableId?

> `optional` **variableId?**: `string`

Defined in: [LFForm/events.ts:25](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L25)

Target field by `variableId` (GUID).

***

### variableName?

> `optional` **variableName?**: `string`

Defined in: [LFForm/events.ts:27](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L27)

Target field by `variableName`.

***

### componentId?

> `optional` **componentId?**: `string`

Defined in: [LFForm/events.ts:29](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L29)

Target field by `componentId`.

***

### index?

> `optional` **index?**: `number`

Defined in: [LFForm/events.ts:31](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L31)

Row/set index for table/collection contexts (0-based).
