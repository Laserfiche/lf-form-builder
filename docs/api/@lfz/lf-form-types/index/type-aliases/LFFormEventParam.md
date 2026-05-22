[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormEventParam

# Type Alias: LFFormEventParam\<EventName\>

> **LFFormEventParam**\<`EventName`\> = `EventName` *extends* [`LFFormFieldEventName`](LFFormFieldEventName.md) ? `LFFormFieldEventParam`\<`EventName`\> : `EventName` *extends* [`LFFormLookupEventName`](LFFormLookupEventName.md) ? `LFFormLookupEventParam`\<`EventName`\> : `never`

Defined in: [LFForm/events.ts:94](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L94)

## Type Parameters

### EventName

`EventName` *extends* [`LFFormFieldEventName`](LFFormFieldEventName.md) \| [`LFFormLookupEventName`](LFFormLookupEventName.md)
