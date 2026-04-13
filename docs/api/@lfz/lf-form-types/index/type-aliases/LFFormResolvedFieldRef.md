[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormResolvedFieldRef

# Type Alias: LFFormResolvedFieldRef\<T\>

> **LFFormResolvedFieldRef**\<`T`\> = `object`

Defined in: LFForm/getters.ts:62

## Type Parameters

### T

`T` *extends* [`LFFormFieldRef`](LFFormFieldRef.md)

## Properties

### fieldId

> **fieldId**: `T`\[`"fieldId"`\]

Defined in: LFForm/getters.ts:63

***

### index

> **index**: `T`\[`"index"`\]

Defined in: LFForm/getters.ts:64

***

### variableId

> **variableId**: `T`\[`"variableId"`\]

Defined in: LFForm/getters.ts:65

***

### variableName

> **variableName**: `T`\[`"variableName"`\]

Defined in: LFForm/getters.ts:66

***

### trackId

> **trackId**: `T`\[`"trackId"`\]

Defined in: LFForm/getters.ts:67

***

### componentType

> **componentType**: `T`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](ComponentTypes.md) ? `T`\[`"componentType"`\] : keyof [`ComponentTypes`](ComponentTypes.md)

Defined in: LFForm/getters.ts:68

***

### isDisabled

> **isDisabled**: `T`\[`"settings"`\] *extends* `object` ? `true` : `T`\[`"disabled"`\] *extends* `true` ? `true` : `false`

Defined in: LFForm/getters.ts:71

***

### isMultiple

> **isMultiple**: `T`\[`"settings"`\] *extends* \{ `isInCollection`: `true`; \} \| \{ `isInTable`: `true`; \} ? `true` : `false`

Defined in: LFForm/getters.ts:76
