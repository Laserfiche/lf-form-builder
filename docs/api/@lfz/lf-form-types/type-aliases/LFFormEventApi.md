[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFFormEventApi

# Type Alias: LFFormEventApi

> **LFFormEventApi** = `object`

Defined in: LFForm/events.ts:121

## Properties

### onFieldBlur

> **onFieldBlur**: (`handler`, `options`) => `void`

Defined in: LFForm/events.ts:135

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"fieldBlur"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"fieldBlur"`\>

#### Returns

`void`

***

### onFieldChange

> **onFieldChange**: (`handler`, `options`) => `void`

Defined in: LFForm/events.ts:131

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"fieldChange"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"fieldChange"`\>

#### Returns

`void`

***

### onFormSubmission

> **onFormSubmission**: (`handler`, `options?`) => `void`

Defined in: LFForm/events.ts:139

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"formSubmission"`\>

##### options?

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"formSubmission"`\>

#### Returns

`void`

***

### onLookupDone

> **onLookupDone**: (`handler`, `options`) => `void`

Defined in: LFForm/events.ts:147

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"lookupDone"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"lookupDone"`\>

#### Returns

`void`

***

### onLookupTrigger

> **onLookupTrigger**: (`handler`, `options`) => `void`

Defined in: LFForm/events.ts:143

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"lookupTrigger"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"lookupTrigger"`\>

#### Returns

`void`

***

### subscribe

> **subscribe**: \<`EventName`\>(`eventName`, `handler`, `options`) => `void`

Defined in: LFForm/events.ts:122

#### Type Parameters

##### EventName

`EventName` *extends* [`LFFormSupportedEvents`](LFFormSupportedEvents.md)

#### Parameters

##### eventName

`EventName`

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`EventName`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`EventName`\>

#### Returns

`void`

***

### unsubscribe

> **unsubscribe**: \<`EventName`\>(`eventName`, `options`) => `void`

Defined in: LFForm/events.ts:127

#### Type Parameters

##### EventName

`EventName` *extends* [`LFFormSupportedEvents`](LFFormSupportedEvents.md)

#### Parameters

##### eventName

`EventName`

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`EventName`\>

#### Returns

`void`
