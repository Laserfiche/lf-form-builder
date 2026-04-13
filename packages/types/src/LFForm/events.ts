import type { LFFormIdParam } from './getters.js';

/** Identifies a lookup rule by its numeric rule ID (matches the Rules pane numbering). */
export type LFFormLookupId = { lookupRuleId: number };

/** Options for event subscription handlers including targeting and naming. */
export type LFFormEventParamOption = {
  /** Unique name for this handler, used for later unsubscription. */
  handlerName?: string;
  /** When `true`, prevents this handler from being unsubscribed. */
  cannotUnsubscribe?: boolean;
  /** Target field by numeric `fieldId`. */
  fieldId?: number;
  /** Target field by `variableId` (GUID). */
  variableId?: string;
  /** Target field by `variableName`. */
  variableName?: string;
  /** Target field by `componentId`. */
  componentId?: string;
  /** Row/set index for table/collection contexts (0-based). */
  index?: number;
};

/** Map of submission event names. */
export const LFFormSubmissionEventMap = {
  formSubmission: 'formSubmission',
} as const;

/** Map of lookup lifecycle event names. */
export const LFFormLookupEventMap = {
  lookupTrigger: 'lookupTrigger',
  lookupDone: 'lookupDone',
} as const;

/** Map of field-level event names. */
export const LFFormFieldEventMap = {
  fieldChange: 'fieldChange',
  fieldBlur: 'fieldBlur',
} as const;

/** Combined map of all supported LFForm event names. */
export const LFFormAllSupportedEventMap = {
  ...LFFormSubmissionEventMap,
  ...LFFormLookupEventMap,
  ...LFFormFieldEventMap,
} as const;

export type LFFormSubmissionEventName = keyof typeof LFFormSubmissionEventMap;
export type LFFormLookupEventName = keyof typeof LFFormLookupEventMap;
export type LFFormFieldEventName = keyof typeof LFFormFieldEventMap;
export type LFFormCanonicalEventName =
  | LFFormSubmissionEventName
  | LFFormLookupEventName
  | LFFormFieldEventName;
export type LFFormSupportedEvents = keyof typeof LFFormAllSupportedEventMap;

export const isLFFormSupportedEvent = (
  eventName: string,
): eventName is LFFormSupportedEvents => eventName in LFFormAllSupportedEventMap;

type LFFormHandlerNameOption = {
  handlerName?: string;
};

type LFFormLookupSubscribeOption = LFFormHandlerNameOption & {
  lookupRuleId: number;
};

type LFFormFieldEventParam<EventName extends LFFormFieldEventName> = {
  eventName: EventName;
  options: LFFormEventParamOption[];
};

type LFFormLookupEventParam<EventName extends LFFormLookupEventName> = {
  eventName: EventName;
  options: [LFFormLookupId, ...LFFormEventParamOption[]];
};

export type LFFormEventParam<
  EventName extends LFFormFieldEventName | LFFormLookupEventName,
> = EventName extends LFFormFieldEventName
  ? LFFormFieldEventParam<EventName>
  : EventName extends LFFormLookupEventName
    ? LFFormLookupEventParam<EventName>
    : never;

/**
 * Event payload for form submission events.
 * Contains the action metadata (button label and value) that triggered the submission.
 */
export type LFFormSubmissionEventParam = {
  eventName: LFFormSubmissionEventName;
  /** Action metadata. `action.value` identifies which button was clicked (e.g. `'Submit'`, `'Reject'`). */
  data?: { action: { label: string; value: string } };
};

/** Maps event names to their payload types. */
export type LFFormEventPayloadMap = {
  formSubmission: LFFormSubmissionEventParam;
  fieldChange: LFFormEventParam<'fieldChange'>;
  fieldBlur: LFFormEventParam<'fieldBlur'>;
  lookupTrigger: LFFormEventParam<'lookupTrigger'>;
  lookupDone: LFFormEventParam<'lookupDone'>;
};

/** Maps event names to their expected handler return types. */
export type LFFormEventReturnMap = {
  formSubmission: { error: string } | void;
  fieldChange: void;
  fieldBlur: void;
  lookupTrigger: { cancelLookup: boolean } | void;
  lookupDone: void;
  change: void;
  blur: void;
};

export type LFFormEventOptions<
  EventName extends LFFormSupportedEvents,
> = EventName extends LFFormLookupEventName
  ? LFFormLookupSubscribeOption
  : LFFormHandlerNameOption;

export type LFFormEventSubscribeOptions<
  EventName extends LFFormSupportedEvents,
> = EventName extends LFFormSubmissionEventName
  ? LFFormEventOptions<EventName>
  : LFFormIdParam & LFFormEventOptions<EventName>;

export type LFFormEventHandler<
  EventParam,
  ReturnType = void,
> = (event: EventParam) => ReturnType | Promise<ReturnType>;

export type LFFormTypedEventHandler<
  EventName extends LFFormSupportedEvents,
> = LFFormEventHandler<
  LFFormEventPayloadMap[EventName],
  LFFormEventReturnMap[EventName]
>;

/**
 * Event APIs for subscribing to and handling form, field, and lookup events.
 *
 * @remarks
 * Supported event names: `formSubmission`, `fieldChange`, `fieldBlur`, `lookupTrigger`, `lookupDone`.
 *
 * @example
 * ```javascript
 * const formFields = {
 *   approvalComments: { fieldId: 120 },
 *   firstName: { fieldId: 10 },
 *   triggerField: { fieldId: 130 },
 *   lookupTarget: { fieldId: 131 },
 * };
 *
 * LFForm.subscribe('fieldChange', () => console.log('changed'), formFields.firstName);
 * LFForm.unsubscribe('fieldChange', formFields.firstName);
 *
 * LFForm.onFormSubmission((event) => {
 *   const action = event?.data?.action?.value;
 *   const comments = LFForm.getFieldValues(formFields.approvalComments);
 *   if (action === 'Reject' && !comments) {
 *     return { error: 'Comments are required when rejecting.' };
 *   }
 * });
 *
 * LFForm.onLookupTrigger(() => {
 *   if (LFForm.getFieldValues(formFields.triggerField) === 'NoCall') {
 *     return { cancelLookup: true };
 *   }
 * }, { lookupRuleId: 3 });
 *
 * LFForm.onLookupDone(() => {
 *   if (LFForm.getFieldValues(formFields.lookupTarget) === 'Hello') {
 *     LFForm.setFieldValues(formFields.lookupTarget, 'World!');
 *   }
 * }, { lookupRuleId: 2 });
 * ```
 * @group LFForm
 * @category LFForm Events
 */
export type LFFormEventApi = {
  /**
   * Subscribes a handler to an LFForm event.
   *
   * @param eventName - One of the supported event names.
   * @param handler - Callback to execute when the event fires.
   * @param options - Identification/options including target field and `handlerName`.
   */
  subscribe: <EventName extends LFFormSupportedEvents>(
    eventName: EventName,
    handler: LFFormTypedEventHandler<EventName>,
    options: LFFormEventSubscribeOptions<EventName>,
  ) => void;

  /**
   * Unsubscribes a handler from an LFForm event.
   *
   * @param eventName - The event to unsubscribe from.
   * @param options - Must match the options used during subscription.
   */
  unsubscribe: <EventName extends LFFormSupportedEvents>(
    eventName: EventName,
    options: LFFormEventSubscribeOptions<EventName>,
  ) => void;

  /**
   * Registers a field change handler. Fires after the field value is updated.
   *
   * @remarks
   * Use `onFieldChange` when your logic depends on the field's updated value
   * already being available. This is the safer choice when reacting to
   * lookup-populated fields or recalculating adjacent field output.
   */
  onFieldChange: (
    handler: LFFormTypedEventHandler<'fieldChange'>,
    options: LFFormEventSubscribeOptions<'fieldChange'>,
  ) => void;

  /**
   * Registers a field blur handler. Fires when focus leaves the field.
   *
   * @remarks
   * Useful for lighter validation or formatting after a user leaves a field.
   */
  onFieldBlur: (
    handler: LFFormTypedEventHandler<'fieldBlur'>,
    options: LFFormEventSubscribeOptions<'fieldBlur'>,
  ) => void;

  /**
   * Registers a form submission handler.
   *
   * @remarks
   * - Return `{ error: string }` to block submission and display the error message.
   * - Async handlers are supported.
   * - The event includes action metadata in `event.data.action`.
   */
  onFormSubmission: (
    handler: LFFormTypedEventHandler<'formSubmission'>,
    options?: LFFormEventSubscribeOptions<'formSubmission'>,
  ) => void;

  /**
   * Registers a handler that runs **before** a lookup request is sent.
   *
   * @remarks
   * - Return `{ cancelLookup: true }` to cancel the lookup call.
   * - `lookupRuleId` matches the rule number in the Rules pane.
   * - Use this to inspect inputs, block a lookup, or adjust pre-lookup behavior.
   */
  onLookupTrigger: (
    handler: LFFormTypedEventHandler<'lookupTrigger'>,
    options: LFFormEventSubscribeOptions<'lookupTrigger'>,
  ) => void;

  /**
   * Registers a handler that runs **after** a lookup request completes.
   *
   * @remarks
   * Do **not** assume lookup target fields have been populated when this handler runs.
   * If your logic needs the resulting field value, prefer `onFieldChange` on the
   * destination field instead of relying on lookup timing.
   */
  onLookupDone: (
    handler: LFFormTypedEventHandler<'lookupDone'>,
    options: LFFormEventSubscribeOptions<'lookupDone'>,
  ) => void;
};
