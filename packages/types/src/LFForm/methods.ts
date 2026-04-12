import type { LFFormChangeFormSettings } from '../types/FormSettings.js';
import type {
  ComponentTypes,
  LFFormField,
  LFFormChangeFieldSettingsType,
  LFFormSetFieldValueType,
  LFFormExtractComponentType,
} from '../types/LFFormField.js';
import type {
  LFFormFieldRef,
  LFFormId,
  LFFormIdParam,
  LFFormResolvedFieldRef,
} from './getters.js';

export type LFFormPromiseResponse =
  | { success: true; error?: never }
  | { success: false; error: string };

export type LFFormActionButtonDefault =
  | 'Submit'
  | 'Approve'
  | 'Reject'
  | 'SaveAsDraft';

export type LFFormSetFieldValues = <
  FieldValType extends LFFormField | LFFormField[] = LFFormField,
  T extends LFFormFieldRef = LFFormFieldRef,
>(
  id: T | T[],
  value: LFFormResolvedFieldRef<T>['isDisabled'] extends true
    ? never
    : T['componentType'] extends keyof ComponentTypes
      ? // T explicitly has componentType, use it
        | LFFormSetFieldValueType<
            ComponentTypes[T['componentType'] & keyof ComponentTypes]
          >
          | Array<
              LFFormSetFieldValueType<
                ComponentTypes[T['componentType'] & keyof ComponentTypes]
              >
            >
      : // T doesn't have componentType, use explicit FieldValType (non-distributive check to avoid per-type array splitting)
        [FieldValType] extends [Array<infer ElemType extends LFFormField>]
        ?
            | LFFormSetFieldValueType<ComponentTypes[LFFormExtractComponentType<ElemType>]>
            | Array<LFFormSetFieldValueType<ComponentTypes[LFFormExtractComponentType<ElemType>]>>
        :
            | LFFormSetFieldValueType<ComponentTypes[LFFormExtractComponentType<FieldValType>]>
            | Array<LFFormSetFieldValueType<ComponentTypes[LFFormExtractComponentType<FieldValType>]>>,
) => Promise<{ success: true; error?: never } | { success: false; error: string }>;

export type LFFormMethodApi<FieldType extends LFFormFieldRef = LFFormFieldRef> =
  {
    setFieldValues: LFFormSetFieldValues;
    changeFieldSettings: <FieldSettingType extends LFFormFieldRef = FieldType>(
      id: LFFormIdParam,
      changes: LFFormChangeFieldSettingsType<
        ComponentTypes[LFFormResolvedFieldRef<FieldSettingType>['componentType']]
      >,
    ) => Promise<LFFormPromiseResponse>;
    changeFieldOptions: (
      id: LFFormIdParam,
      changes: { label?: string; value?: string; selected?: boolean }[],
      mode?: 'add' | 'remove' | 'replace',
    ) => Promise<LFFormPromiseResponse>;
    changeFormSettings: (
      changes: LFFormChangeFormSettings,
    ) => Promise<LFFormPromiseResponse>;
    disableFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;
    enableFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;
    showFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;
    hideFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;
    addRow: (
      id: LFFormIdParam,
      count: number,
    ) => Promise<LFFormPromiseResponse>;
    addSet: (
      id: LFFormIdParam,
      count: number,
    ) => Promise<LFFormPromiseResponse>;
    deleteRow: (
      id: LFFormIdParam,
      ...index: number[]
    ) => Promise<LFFormPromiseResponse>;
    deleteSet: (
      id: LFFormIdParam,
      ...index: number[]
    ) => Promise<LFFormPromiseResponse>;
    addCSSClasses: (
      id: LFFormIdParam,
      classes: string | string[],
    ) => Promise<LFFormPromiseResponse>;
    removeCSSClasses: (
      id: LFFormIdParam,
      classes: string | string[],
    ) => Promise<LFFormPromiseResponse>;
    getLaserficheAPIClient: <T>(client: string) => Promise<T>;
    changeActionButton: (
      buttonName: LFFormActionButtonDefault | string,
      actionButtonInfo: { label: string },
    ) => Promise<LFFormPromiseResponse>;
    changeActionButtons: (
      actionButtonsToChange: Array<{
        action: LFFormActionButtonDefault | string;
        label: string;
      }>,
    ) => Promise<LFFormPromiseResponse>;
    validateFields: (
      id: LFFormIdParam,
      validationOptions: { required: boolean },
    ) => Promise<LFFormPromiseResponse>;
  };
