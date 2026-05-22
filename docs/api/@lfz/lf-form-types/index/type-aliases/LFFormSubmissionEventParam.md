[Documentation](../../../../index.md) / [@lf/lf-form-types](../../index.md) / [index](../index.md) / LFFormSubmissionEventParam

# Type Alias: LFFormSubmissionEventParam

> **LFFormSubmissionEventParam** = `object`

Defined in: [LFForm/events.ts:106](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L106)

Event payload for form submission events.
Contains the action metadata (button label and value) that triggered the submission.

## Properties

### eventName

> **eventName**: [`LFFormSubmissionEventName`](LFFormSubmissionEventName.md)

Defined in: [LFForm/events.ts:107](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L107)

***

### data?

> `optional` **data?**: `object`

Defined in: [LFForm/events.ts:109](https://github.com/Laserfiche/lf-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/events.ts#L109)

Action metadata. `action.value` identifies which button was clicked (e.g. `'Submit'`, `'Reject'`).

#### action

> **action**: `object`

##### action.label

> **label**: `string`

##### action.value

> **value**: `string`
