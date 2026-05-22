[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormEventApi

# Type Alias: LFFormEventApi

> **LFFormEventApi** = `object`

Defined in: [LFForm/events.ts:203](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L203)

Event APIs for subscribing to and handling form, field, and lookup events.

## Remarks

Supported event names: `formSubmission`, `fieldChange`, `fieldBlur`, `lookupTrigger`, `lookupDone`.

## Example

```javascript
const formFields = {
  approvalComments: { fieldId: 120 },
  firstName: { fieldId: 10 },
  triggerField: { fieldId: 130 },
  lookupTarget: { fieldId: 131 },
};

LFForm.subscribe('fieldChange', () => console.log('changed'), formFields.firstName);
LFForm.unsubscribe('fieldChange', formFields.firstName);

LFForm.onFormSubmission((event) => {
  const action = event?.data?.action?.value;
  const comments = LFForm.getFieldValues(formFields.approvalComments);
  if (action === 'Reject' && !comments) {
    return { error: 'Comments are required when rejecting.' };
  }
});

LFForm.onLookupTrigger(() => {
  if (LFForm.getFieldValues(formFields.triggerField) === 'NoCall') {
    return { cancelLookup: true };
  }
}, { lookupRuleId: 3 });

LFForm.onLookupDone(() => {
  if (LFForm.getFieldValues(formFields.lookupTarget) === 'Hello') {
    LFForm.setFieldValues(formFields.lookupTarget, 'World!');
  }
}, { lookupRuleId: 2 });
```

## Properties

### subscribe

> **subscribe**: \<`EventName`\>(`eventName`, `handler`, `options`) => `void`

Defined in: [LFForm/events.ts:211](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L211)

Subscribes a handler to an LFForm event.

#### Type Parameters

##### EventName

`EventName` *extends* [`LFFormSupportedEvents`](LFFormSupportedEvents.md)

#### Parameters

##### eventName

`EventName`

One of the supported event names.

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`EventName`\>

Callback to execute when the event fires.

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`EventName`\>

Identification/options including target field and `handlerName`.

#### Returns

`void`

***

### unsubscribe

> **unsubscribe**: \<`EventName`\>(`eventName`, `options`) => `void`

Defined in: [LFForm/events.ts:223](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L223)

Unsubscribes a handler from an LFForm event.

#### Type Parameters

##### EventName

`EventName` *extends* [`LFFormSupportedEvents`](LFFormSupportedEvents.md)

#### Parameters

##### eventName

`EventName`

The event to unsubscribe from.

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`EventName`\>

Must match the options used during subscription.

#### Returns

`void`

***

### onFieldChange

> **onFieldChange**: (`handler`, `options`) => `void`

Defined in: [LFForm/events.ts:236](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L236)

Registers a field change handler. Fires after the field value is updated.

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"fieldChange"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"fieldChange"`\>

#### Returns

`void`

#### Remarks

Use `onFieldChange` when your logic depends on the field's updated value
already being available. This is the safer choice when reacting to
lookup-populated fields or recalculating adjacent field output.

***

### onFieldBlur

> **onFieldBlur**: (`handler`, `options`) => `void`

Defined in: [LFForm/events.ts:247](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L247)

Registers a field blur handler. Fires when focus leaves the field.

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"fieldBlur"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"fieldBlur"`\>

#### Returns

`void`

#### Remarks

Useful for lighter validation or formatting after a user leaves a field.

***

### onFormSubmission

> **onFormSubmission**: (`handler`, `options?`) => `void`

Defined in: [LFForm/events.ts:260](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L260)

Registers a form submission handler.

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"formSubmission"`\>

##### options?

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"formSubmission"`\>

#### Returns

`void`

#### Remarks

- Return `{ error: string }` to block submission and display the error message.
- Async handlers are supported.
- The event includes action metadata in `event.data.action`.

***

### onLookupTrigger

> **onLookupTrigger**: (`handler`, `options`) => `void`

Defined in: [LFForm/events.ts:273](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L273)

Registers a handler that runs **before** a lookup request is sent.

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"lookupTrigger"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"lookupTrigger"`\>

#### Returns

`void`

#### Remarks

- Return `{ cancelLookup: true }` to cancel the lookup call.
- `lookupRuleId` matches the rule number in the Rules pane.
- Use this to inspect inputs, block a lookup, or adjust pre-lookup behavior.

***

### onLookupDone

> **onLookupDone**: (`handler`, `options`) => `void`

Defined in: [LFForm/events.ts:286](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L286)

Registers a handler that runs **after** a lookup request completes.

#### Parameters

##### handler

[`LFFormTypedEventHandler`](LFFormTypedEventHandler.md)\<`"lookupDone"`\>

##### options

[`LFFormEventSubscribeOptions`](LFFormEventSubscribeOptions.md)\<`"lookupDone"`\>

#### Returns

`void`

#### Remarks

Do **not** assume lookup target fields have been populated when this handler runs.
If your logic needs the resulting field value, prefer `onFieldChange` on the
destination field instead of relying on lookup timing.
