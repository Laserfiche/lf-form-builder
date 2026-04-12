import type {
  ComponentTypes,
  LFFormField,
  LFFormFieldValueType,
} from '../types/LFFormField.js';

export type LFFormId = {
  fieldId?: number;
  variableId?: string;
  variableName?: string;
  trackId?: string;
  index?: number;
};

export type LFFormIdParam = LFFormId | LFFormId[];

export type LFFormFieldRef = LFFormId & {
  componentType?: keyof ComponentTypes;
  disabled?: boolean;
  settings?: {
    isInCollection?: boolean;
    isInTable?: boolean;
    readonly?: boolean;
  };
};

export type LFFormResolvedFieldRef<T extends LFFormFieldRef> = {
  fieldId: T['fieldId'];
  index: T['index'];
  variableId: T['variableId'];
  variableName: T['variableName'];
  trackId: T['trackId'];
  componentType: T['componentType'] extends keyof ComponentTypes
    ? T['componentType']
    : keyof ComponentTypes;
  isDisabled: T['settings'] extends { readonly: true }
    ? true
    : T['disabled'] extends true
      ? true
      : false;
  isMultiple: T['settings'] extends
    | { isInCollection: true }
    | { isInTable: true }
    ? true
    : false;
};

export type LFFormGetFieldValues = <
  F extends LFFormField | LFFormField[] | unknown = unknown,
  T extends LFFormFieldRef = LFFormFieldRef,
>(
  id: T | T[],
) => F extends LFFormField
  ? LFFormFieldValueType<F>
  : F extends Array<infer TT extends LFFormField>
    ? LFFormFieldValueType<TT>[]
    : LFFormResolvedFieldRef<T>['isMultiple'] extends true
      ? LFFormFieldValueType<
          ComponentTypes[LFFormResolvedFieldRef<T>['componentType']]
        >[]
      : LFFormFieldValueType<
          ComponentTypes[LFFormResolvedFieldRef<T>['componentType']]
        >;

export interface LFFormFindFieldsBy<
  Param,
  FieldType extends LFFormField | LFFormField[] | LFFormFieldRef = LFFormField,
> {
  <FindFieldType extends FieldType | FieldType[]>(
    findBy: Param,
  ): FindFieldType extends
    | Array<infer TT extends LFFormField>
    | (infer TT extends LFFormField)
    ? TT[]
    : ComponentTypes[LFFormResolvedFieldRef<FieldType>['componentType']] extends
          | LFFormField
          | LFFormField[]
      ? ComponentTypes[LFFormResolvedFieldRef<FieldType>['componentType']][]
      : LFFormField[];
}

export type LFFormGetterApi<FieldType extends LFFormFieldRef = LFFormFieldRef> = {
  getFieldValues: LFFormGetFieldValues;
  findFields: LFFormFindFieldsBy<(field: LFFormField) => boolean, FieldType>;
  findFieldsByClassName: LFFormFindFieldsBy<string, FieldType>;
  findFieldsByFieldId: LFFormFindFieldsBy<number, FieldType>;
  findFieldsByVariableId: LFFormFindFieldsBy<string, FieldType>;
  findFieldsByVariableName: LFFormFindFieldsBy<string, FieldType>;
};
