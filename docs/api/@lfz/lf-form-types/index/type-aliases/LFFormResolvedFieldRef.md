[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormResolvedFieldRef

# Type Alias: LFFormResolvedFieldRef\<T\>

> **LFFormResolvedFieldRef**\<`T`\> = `object`

Defined in: [LFForm/getters.ts:62](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L62)

## Type Parameters

### T

`T` *extends* [`LFFormFieldRef`](LFFormFieldRef.md)

## Properties

### fieldId

> **fieldId**: `T`\[`"fieldId"`\]

Defined in: [LFForm/getters.ts:63](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L63)

***

### index

> **index**: `T`\[`"index"`\]

Defined in: [LFForm/getters.ts:64](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L64)

***

### variableId

> **variableId**: `T`\[`"variableId"`\]

Defined in: [LFForm/getters.ts:65](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L65)

***

### variableName

> **variableName**: `T`\[`"variableName"`\]

Defined in: [LFForm/getters.ts:66](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L66)

***

### trackId

> **trackId**: `T`\[`"trackId"`\]

Defined in: [LFForm/getters.ts:67](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L67)

***

### componentType

> **componentType**: `T`\[`"componentType"`\] *extends* keyof [`ComponentTypes`](ComponentTypes.md) ? `T`\[`"componentType"`\] : keyof [`ComponentTypes`](ComponentTypes.md)

Defined in: [LFForm/getters.ts:68](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L68)

***

### isDisabled

> **isDisabled**: `T`\[`"settings"`\] *extends* `object` ? `true` : `T`\[`"disabled"`\] *extends* `true` ? `true` : `false`

Defined in: [LFForm/getters.ts:71](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L71)

***

### isMultiple

> **isMultiple**: `T`\[`"settings"`\] *extends* \{ `isInCollection`: `true`; \} \| \{ `isInTable`: `true`; \} ? `true` : `false`

Defined in: [LFForm/getters.ts:76](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/getters.ts#L76)
