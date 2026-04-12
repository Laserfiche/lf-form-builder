[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFFormResolvedFieldRef

# Type Alias: LFFormResolvedFieldRef\<T\>

> **LFFormResolvedFieldRef**\<`T`\> = `object`

Defined in: LFForm/getters.ts:27

## Type Parameters

### T

`T` *extends* [`LFFormFieldRef`](LFFormFieldRef.md)

## Properties

### componentType

> **componentType**: `T`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](ComponentTypes.md) ? `T`\[`"componentType"`\] : keyof [`ComponentTypes`](ComponentTypes.md)

Defined in: LFForm/getters.ts:33

***

### fieldId

> **fieldId**: `T`\[`"fieldId"`\]

Defined in: LFForm/getters.ts:28

***

### index

> **index**: `T`\[`"index"`\]

Defined in: LFForm/getters.ts:29

***

### isDisabled

> **isDisabled**: `T`\[`"settings"`\] *extends* `object` ? `true` : `T`\[`"disabled"`\] *extends* `true` ? `true` : `false`

Defined in: LFForm/getters.ts:36

***

### isMultiple

> **isMultiple**: `T`\[`"settings"`\] *extends* \{ `isInCollection`: `true`; \} \| \{ `isInTable`: `true`; \} ? `true` : `false`

Defined in: LFForm/getters.ts:41

***

### trackId

> **trackId**: `T`\[`"trackId"`\]

Defined in: LFForm/getters.ts:32

***

### variableId

> **variableId**: `T`\[`"variableId"`\]

Defined in: LFForm/getters.ts:30

***

### variableName

> **variableName**: `T`\[`"variableName"`\]

Defined in: LFForm/getters.ts:31
