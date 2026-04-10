import { vi, type Mock } from 'vitest';

type MockMode = 'strict' | 'permissive';

type EventName = 'fieldChange' | 'fieldBlur' | 'formSubmission' | 'lookupTrigger' | 'lookupDone';

type EventHandler = (...args: unknown[]) => unknown;

type EventOptions = {
  handlerName?: string;
  fieldId?: number;
  variableId?: string;
  variableName?: string;
  componentId?: string;
  lookupRuleId?: number;
  index?: number;
};

type RegisteredHandler = {
  eventName: EventName;
  handler: EventHandler;
  options?: EventOptions;
};

const successResponse = { success: true } as const;

const createNotImplemented = (mode: MockMode, methodName: string) => {
  return (...args: unknown[]) => {
    if (mode === 'strict') {
      throw new Error(
        `LFForm mock method ${methodName} was called without an explicit mock implementation. Args: ${JSON.stringify(args)}`,
      );
    }
    return undefined;
  };
};

export type LFFormMockControls = {
  mode: MockMode;
  handlers: RegisteredHandler[];
  resetHandlers: () => void;
};

export type LFFormTestMock = {
  findFieldsByFieldId: Mock;
  findFieldsByVariableName: Mock;
  getFieldValues: Mock;
  getLaserficheAPIClient: Mock;
  addRow: Mock;
  deleteRow: Mock;
};

export type LFFormMock = ReturnType<typeof createLFFormMock>;

export const createLFFormMock = (mode: MockMode = 'permissive') => {
  const handlers: RegisteredHandler[] = [];

  const registerHandler = (
    eventName: EventName,
    handler: EventHandler,
    options?: EventOptions,
  ) => {
    handlers.push({ eventName, handler, options });
  };

  const lfForm = {
    step: null,
    stage: null,
    language: null,
    locale: null,
    isCloud: false,
    isPreview: false,
    isReadonly: false,
    isDisabled: false,
    isPrint: false,
    isAnonymousUser: false,
    isDraft: false,
    pageURL: 'http://localhost/',

    getFieldValues: vi.fn(createNotImplemented(mode, 'getFieldValues')),
    setFieldValues: vi.fn(async () => successResponse),
    findFields: vi.fn(() => []),
    findFieldsByClassName: vi.fn(() => []),
    findFieldsByFieldId: vi.fn(() => []),
    findFieldsByVariableId: vi.fn(() => []),
    findFieldsByVariableName: vi.fn(() => []),

    changeFieldSettings: vi.fn(async () => successResponse),
    changeFieldOptions: vi.fn(async () => successResponse),
    changeFormSettings: vi.fn(async () => successResponse),

    disableFields: vi.fn(async () => successResponse),
    enableFields: vi.fn(async () => successResponse),
    showFields: vi.fn(async () => successResponse),
    hideFields: vi.fn(async () => successResponse),

    addRow: vi.fn(async () => successResponse),
    addSet: vi.fn(async () => successResponse),
    deleteRow: vi.fn(async () => successResponse),
    deleteSet: vi.fn(async () => successResponse),

    addCSSClasses: vi.fn(async () => successResponse),
    removeCSSClasses: vi.fn(async () => successResponse),

    getLaserficheAPIClient: vi.fn(
      createNotImplemented(mode, 'getLaserficheAPIClient'),
    ),
    changeActionButton: vi.fn(async () => successResponse),
    changeActionButtons: vi.fn(async () => successResponse),

    onFieldChange: vi.fn((handler: EventHandler, options?: EventOptions) => {
      registerHandler('fieldChange', handler, options);
    }),
    onFieldBlur: vi.fn((handler: EventHandler, options?: EventOptions) => {
      registerHandler('fieldBlur', handler, options);
    }),
    onFormSubmission: vi.fn((handler: EventHandler, options?: EventOptions) => {
      registerHandler('formSubmission', handler, options);
    }),
    onLookupTrigger: vi.fn((handler: EventHandler, options?: EventOptions) => {
      registerHandler('lookupTrigger', handler, options);
    }),
    onLookupDone: vi.fn((handler: EventHandler, options?: EventOptions) => {
      registerHandler('lookupDone', handler, options);
    }),

    unsubscribe: vi.fn((eventName: EventName, options?: EventOptions) => {
      if (!options?.handlerName) {
        return;
      }
      for (let i = handlers.length - 1; i >= 0; i -= 1) {
        const registered = handlers[i];
        if (
          registered.eventName === eventName &&
          registered.options?.handlerName === options.handlerName
        ) {
          handlers.splice(i, 1);
        }
      }
    }),
  };

  Object.defineProperty(lfForm, '__mockControls', {
    value: {
      mode,
      handlers,
      resetHandlers: () => {
        handlers.splice(0, handlers.length);
      },
    } satisfies LFFormMockControls,
    enumerable: false,
  });

  return lfForm;
};

export const getLFFormMockControls = (lfForm: unknown): LFFormMockControls => {
  const controls = (lfForm as { __mockControls?: LFFormMockControls })
    .__mockControls;
  if (!controls) {
    throw new Error('LFForm mock controls are not available on this object');
  }
  return controls;
};

export const getLFFormMock = <T extends object = LFFormTestMock>(): T =>
  globalThis.LFForm as unknown as T;
