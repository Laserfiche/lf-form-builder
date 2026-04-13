[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormSubmissionEventParam

# Type Alias: LFFormSubmissionEventParam

> **LFFormSubmissionEventParam** = `object`

Defined in: LFForm/events.ts:106

Event payload for form submission events.
Contains the action metadata (button label and value) that triggered the submission.

## Properties

### eventName

> **eventName**: [`LFFormSubmissionEventName`](LFFormSubmissionEventName.md)

Defined in: LFForm/events.ts:107

***

### data?

> `optional` **data?**: `object`

Defined in: LFForm/events.ts:109

Action metadata. `action.value` identifies which button was clicked (e.g. `'Submit'`, `'Reject'`).

#### action

> **action**: `object`

##### action.label

> **label**: `string`

##### action.value

> **value**: `string`
