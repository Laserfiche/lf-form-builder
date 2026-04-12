import type { LFFormIdParam } from './getters.js';

export type LFFormLookupId = { lookupRuleId: number };

export type LFFormEventParamOption = {
  handlerName?: string;
  cannotUnsubscribe?: boolean;
  fieldId?: number;
  variableId?: string;
  variableName?: string;
  componentId?: string;
  index?: number;
};

export const LFFormSubmissionEventMap = {
  formSubmission: 'formSubmission',
} as const;

export const LFFormLookupEventMap = {
  lookupTrigger: 'lookupTrigger',
  lookupDone: 'lookupDone',
} as const;

export const LFFormFieldEventMap = {
  fieldChange: 'fieldChange',
  fieldBlur: 'fieldBlur',
} as const;

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

export type LFFormSubmissionEventParam = {
  eventName: LFFormSubmissionEventName;
  data?: { action: { label: string; value: string } };
};

export type LFFormEventPayloadMap = {
  formSubmission: LFFormSubmissionEventParam;
  fieldChange: LFFormEventParam<'fieldChange'>;
  fieldBlur: LFFormEventParam<'fieldBlur'>;
  lookupTrigger: LFFormEventParam<'lookupTrigger'>;
  lookupDone: LFFormEventParam<'lookupDone'>;
};

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

export type LFFormEventApi = {
  subscribe: <EventName extends LFFormSupportedEvents>(
    eventName: EventName,
    handler: LFFormTypedEventHandler<EventName>,
    options: LFFormEventSubscribeOptions<EventName>,
  ) => void;
  unsubscribe: <EventName extends LFFormSupportedEvents>(
    eventName: EventName,
    options: LFFormEventSubscribeOptions<EventName>,
  ) => void;
  onFieldChange: (
    handler: LFFormTypedEventHandler<'fieldChange'>,
    options: LFFormEventSubscribeOptions<'fieldChange'>,
  ) => void;
  onFieldBlur: (
    handler: LFFormTypedEventHandler<'fieldBlur'>,
    options: LFFormEventSubscribeOptions<'fieldBlur'>,
  ) => void;
  onFormSubmission: (
    handler: LFFormTypedEventHandler<'formSubmission'>,
    options?: LFFormEventSubscribeOptions<'formSubmission'>,
  ) => void;
  onLookupTrigger: (
    handler: LFFormTypedEventHandler<'lookupTrigger'>,
    options: LFFormEventSubscribeOptions<'lookupTrigger'>,
  ) => void;
  onLookupDone: (
    handler: LFFormTypedEventHandler<'lookupDone'>,
    options: LFFormEventSubscribeOptions<'lookupDone'>,
  ) => void;
};
