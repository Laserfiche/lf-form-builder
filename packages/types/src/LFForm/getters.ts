import type {
  ComponentTypes,
  LFFormField,
  LFFormFieldValueType,
} from '../types/LFFormField.js';

/**
 * Identification object that tells LFForm which field(s) to target.
 *
 * @remarks
 * - Prefer `fieldId` for reliability, especially with repeatable (table/collection) fields.
 * - `variableName` is convenient for non-repeatable fields but should not be used for table/collection columns.
 * - `index` starts at `0` and targets a specific row/set instance.
 * - For template-aware APIs on repeatables:
 *   - **With** `index`: change applies only to that row/set.
 *   - **Without** `index`: change applies to the template and all existing/future rows/sets.
 *
 * @example
 * ```javascript
 * const byFieldId = { fieldId: 10 };
 * const byVariableName = { variableName: 'First_Name' };
 * const rowTwoInTableColumn = { fieldId: 31, index: 1 };
 * ```
 * 
 * @group LFForm
 * @category LFForm Identifiers
 */
export type LFFormId = {
  /** Numeric field identifier. Preferred for repeatable fields. */
  fieldId?: number;
  /** Variable GUID string. */
  variableId?: string;
  /** Variable name string. Convenient for non-repeatable fields. */
  variableName?: string;
  /** Runtime-unique field instance identifier. Useful for advanced instance-specific targeting. */
  trackId?: string;
  /** Row/set index for table/collection contexts (0-based). */
  index?: number;
};

/**
 * Accepts a single {@link LFFormId} or an array of them.
 * Most LFForm APIs accept this union type as their target parameter.
 *
 * @group LFForm
 * @category LFForm Getters
 */
export type LFFormIdParam = LFFormId | LFFormId[];

/** @group LFForm @category LFForm Getters */
export type LFFormFieldRef = LFFormId & {
  componentType?: keyof ComponentTypes;
  disabled?: boolean;
  settings?: {
    isInCollection?: boolean;
    isInTable?: boolean;
    readonly?: boolean;
  };
};

/** @group LFForm @category LFForm Getters */
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

/**
 * Gets field values for one or more matching fields.
 *
 * - If exactly one field matches, returns a single value.
 * - If multiple fields match (e.g. across table/collection rows), returns an array.
 * - A table column with a single row returns a single value (not an array).
 * - Supply `index` in the id to target a specific row/set.
 *
 * @example
 * ```javascript
 * const formFields = {
 *   firstName: { fieldId: 10 },
 *   expenseAmountColumn: { fieldId: 31 },
 * };
 *
 * const firstName = LFForm.getFieldValues(formFields.firstName);
 * const allRowAmounts = LFForm.getFieldValues(formFields.expenseAmountColumn);
 * const firstRowAmount = LFForm.getFieldValues({ fieldId: 31, index: 0 });
 * ```
 */
/** @group LFForm @category LFForm Getters */
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

/** @group LFForm @category LFForm Getters */
export type LFFormFindFieldsBy<
  Param,
  FieldType extends LFFormField | LFFormField[] | LFFormFieldRef = LFFormField,
> = ({
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
});

/**
 * Getter APIs for reading field values and querying fields.
 *
 * @example
 * ```javascript
 * const required = LFForm.findFields((f) => Boolean(f.settings?.required));
 * const idMatches = LFForm.findFieldsByFieldId(10);
 * const classMatches = LFForm.findFieldsByClassName('blue');
 * ```
 * 
 * @group LFForm
 * @category LFForm Main API
 */
export type LFFormGetterApi<FieldType extends LFFormFieldRef = LFFormFieldRef> = {
  /** Gets field values for one or more matching fields. */
  getFieldValues: LFFormGetFieldValues;
  /** Finds fields matching an arbitrary predicate function. */
  findFields: LFFormFindFieldsBy<(field: LFFormField) => boolean, FieldType>;
  /** Finds fields by CSS class name. */
  findFieldsByClassName: LFFormFindFieldsBy<string, FieldType>;
  /** Finds fields by numeric `fieldId`. */
  findFieldsByFieldId: LFFormFindFieldsBy<number, FieldType>;
  /** Finds fields by `variableId` (GUID string). */
  findFieldsByVariableId: LFFormFindFieldsBy<string, FieldType>;
  /** Finds fields by `variableName` string. */
  findFieldsByVariableName: LFFormFindFieldsBy<string, FieldType>;
};
