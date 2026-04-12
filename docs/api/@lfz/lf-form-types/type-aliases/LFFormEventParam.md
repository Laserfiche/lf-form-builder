[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFFormEventParam

# Type Alias: LFFormEventParam\<EventName\>

> **LFFormEventParam**\<`EventName`\> = `EventName` *extends* [`LFFormFieldEventName`](LFFormFieldEventName.md) ? `LFFormFieldEventParam`\<`EventName`\> : `EventName` *extends* [`LFFormLookupEventName`](LFFormLookupEventName.md) ? `LFFormLookupEventParam`\<`EventName`\> : `never`

Defined in: LFForm/events.ts:66

## Type Parameters

### EventName

`EventName` *extends* [`LFFormFieldEventName`](LFFormFieldEventName.md) \| [`LFFormLookupEventName`](LFFormLookupEventName.md)
