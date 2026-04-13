[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormEventParamOption

# Type Alias: LFFormEventParamOption

> **LFFormEventParamOption** = `object`

Defined in: LFForm/events.ts:17

Options for event subscription handlers including targeting and naming.

## Properties

### handlerName?

> `optional` **handlerName?**: `string`

Defined in: LFForm/events.ts:19

Unique name for this handler, used for later unsubscription.

***

### cannotUnsubscribe?

> `optional` **cannotUnsubscribe?**: `boolean`

Defined in: LFForm/events.ts:21

When `true`, prevents this handler from being unsubscribed.

***

### fieldId?

> `optional` **fieldId?**: `number`

Defined in: LFForm/events.ts:23

Target field by numeric `fieldId`.

***

### variableId?

> `optional` **variableId?**: `string`

Defined in: LFForm/events.ts:25

Target field by `variableId` (GUID).

***

### variableName?

> `optional` **variableName?**: `string`

Defined in: LFForm/events.ts:27

Target field by `variableName`.

***

### componentId?

> `optional` **componentId?**: `string`

Defined in: LFForm/events.ts:29

Target field by `componentId`.

***

### index?

> `optional` **index?**: `number`

Defined in: LFForm/events.ts:31

Row/set index for table/collection contexts (0-based).
