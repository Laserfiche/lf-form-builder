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

/**
 * Standard response returned by mutating LFForm methods.
 * On success: `{ success: true }`. On failure: `{ success: false, error: string }`.
 *
 * @group LFForm
 * @category LFForm Methods
 */
export type LFFormPromiseResponse =
  | { success: true; error?: never }
  | { success: false; error: string };

/**
 * Default action button identifiers recognized by `changeActionButton` and `changeActionButtons`.
 * Custom action class strings are also accepted.
 *
 * @group LFForm
 * @category LFForm Methods
 */
export type LFFormActionButtonDefault =
  | 'Submit'
  | 'Approve'
  | 'Reject'
  | 'SaveAsDraft';

/**
 * Sets field values for one or more matching fields.
 *
 * @remarks
 * **Repeatable behavior:**
 * - Single field: pass a scalar or object value.
 * - Repeatable column (all rows): pass a scalar (sets every row) or a row-ordered array.
 * - Specific row/set: include `index` in the id.
 *
 * Read-only fields cannot be changed. Value type must match the field type.
 *
 * @example
 * ```javascript
 * const formFields = {
 *   status: { fieldId: 40 },
 *   expenseAmountColumn: { fieldId: 31 },
 *   foodChoice: { fieldId: 50 },
 *   geolocation: { fieldId: 60 },
 * };
 *
 * await LFForm.setFieldValues(formFields.status, 'Open');
 * await LFForm.setFieldValues(formFields.foodChoice, { value: ['Option1', 'Option2'] });
 * await LFForm.setFieldValues(formFields.geolocation, { latitude: 33.68, longitude: -117.82 });
 *
 * // Set all rows to 0, or set each row by index-ordered array
 * await LFForm.setFieldValues(formFields.expenseAmountColumn, 0);
 * await LFForm.setFieldValues(formFields.expenseAmountColumn, [120, 80, 55]);
 * await LFForm.setFieldValues({ fieldId: 31, index: 0 }, 120);
 * ```
 *
 * @group LFForm
 * @category LFForm Methods
 */
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

/**
 * Mutating APIs for setting values, changing settings, toggling visibility, and more.
 *
 * @remarks
 * All mutating methods return `Promise<LFFormPromiseResponse>` unless noted otherwise.
 * Await these calls to ensure changes are applied before continuing.
 * 
 * @group LFForm
 * @category LFForm Main API
 */
export type LFFormMethodApi<FieldType extends LFFormFieldRef = LFFormFieldRef> =
  {
    /** Sets field values for one or more matching fields. */
    setFieldValues: LFFormSetFieldValues;

    /**
     * Changes settings on target fields. Template-aware for table/collection fields.
     *
     * @example
     * ```javascript
     * await LFForm.changeFieldSettings({ fieldId: 10 }, {
     *   label: 'Given Name',
     *   description: 'Use your legal first name',
     *   placeholder: 'John',
     *   tooltip: 'As shown on your ID',
     * });
     * ```
     */
    changeFieldSettings: <FieldSettingType extends LFFormFieldRef = FieldType>(
      id: LFFormIdParam,
      changes: LFFormChangeFieldSettingsType<
        ComponentTypes[LFFormResolvedFieldRef<FieldSettingType>['componentType']]
      >,
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Adds, removes, or replaces options on dropdown, radio, or checkbox fields.
     *
     * @param id - Target field(s).
     * @param changes - Array of option objects with `label`, `value`, and optional `selected`.
     * @param mode - `'add'` (default), `'remove'`, or `'replace'`.
     */
    changeFieldOptions: (
      id: LFFormIdParam,
      changes: { label?: string; value?: string; selected?: boolean }[],
      mode?: 'add' | 'remove' | 'replace',
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Changes form-level settings (title, description, browser title, pagination).
     *
     * @example
     * ```javascript
     * await LFForm.changeFormSettings({
     *   title: 'Expense Report',
     *   browserTitle: 'Expense Report | Internal',
     *   description: 'Complete all required fields.',
     * });
     * ```
     */
    changeFormSettings: (
      changes: LFFormChangeFormSettings,
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Disables target fields. Template-aware for table/collection fields.
     *
     * @example
     * ```javascript
     * await LFForm.disableFields({ fieldId: 70 });
     * ```
     */
    disableFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Enables target fields. Template-aware for table/collection fields.
     *
     * @example
     * ```javascript
     * await LFForm.enableFields({ fieldId: 70 });
     * ```
     */
    enableFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Shows target fields. Template-aware for table/collection fields.
     *
     * @example
     * ```javascript
     * await LFForm.showFields({ fieldId: 70 });
     * ```
     */
    showFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Hides target fields. Template-aware for table/collection fields.
     *
     * @example
     * ```javascript
     * await LFForm.hideFields([{ fieldId: 3, index: 1 }, { fieldId: 3, index: 3 }]);
     * ```
     */
    hideFields: (
      id: LFFormIdParam,
      ...ids: LFFormId[]
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Adds rows to a table field.
     *
     * @param id - Table field target.
     * @param count - Number of rows to add.
     *
     * @example
     * ```javascript
     * await LFForm.addRow({ fieldId: 30 }, 3);
     * ```
     */
    addRow: (
      id: LFFormIdParam,
      count: number,
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Adds sets to a collection field.
     *
     * @param id - Collection field target.
     * @param count - Number of sets to add.
     *
     * @example
     * ```javascript
     * await LFForm.addSet({ fieldId: 90 }, 2);
     * ```
     */
    addSet: (
      id: LFFormIdParam,
      count: number,
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Deletes specific rows from a table field by index.
     *
     * @param id - Table field target.
     * @param index - One or more 0-based row indexes to delete.
     *
     * @example
     * ```javascript
     * await LFForm.deleteRow({ fieldId: 30 }, 0);
     * ```
     */
    deleteRow: (
      id: LFFormIdParam,
      ...index: number[]
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Deletes specific sets from a collection field by index.
     *
     * @param id - Collection field target.
     * @param index - One or more 0-based set indexes to delete.
     *
     * @example
     * ```javascript
     * await LFForm.deleteSet({ fieldId: 90 }, 0, 1);
     * ```
     */
    deleteSet: (
      id: LFFormIdParam,
      ...index: number[]
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Adds CSS classes to target fields. Existing classes are not duplicated.
     *
     * @example
     * ```javascript
     * await LFForm.addCSSClasses({ fieldId: 100 }, 'highlight urgent');
     * ```
     */
    addCSSClasses: (
      id: LFFormIdParam,
      classes: string | string[],
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Removes CSS classes from target fields. Removing a non-existent class is a no-op.
     *
     * @example
     * ```javascript
     * await LFForm.removeCSSClasses({ fieldId: 100 }, ['urgent']);
     * ```
     */
    removeCSSClasses: (
      id: LFFormIdParam,
      classes: string | string[],
    ) => Promise<LFFormPromiseResponse>;

    /** Returns a Laserfiche API client instance by name. */
    getLaserficheAPIClient: <T>(client: string) => Promise<T>;

    /**
     * Changes the label for a single action button.
     *
     * @param buttonName - A default action (`'Submit'`, `'Approve'`, etc.) or custom action class.
     * @param actionButtonInfo - Object with the new `label`.
     *
     * @example
     * ```javascript
     * await LFForm.changeActionButton('Submit', { label: 'Send Request' });
     * ```
     */
    changeActionButton: (
      buttonName: LFFormActionButtonDefault | string,
      actionButtonInfo: { label: string },
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Changes labels for multiple action buttons at once.
     *
     * @example
     * ```javascript
     * await LFForm.changeActionButtons([
     *   { action: 'Approve', label: 'Approve Request' },
     *   { action: 'Reject', label: 'Reject Request' },
     *   { action: 'SaveAsDraft', label: 'Save Draft' },
     * ]);
     * ```
     */
    changeActionButtons: (
      actionButtonsToChange: Array<{
        action: LFFormActionButtonDefault | string;
        label: string;
      }>,
    ) => Promise<LFFormPromiseResponse>;

    /**
     * Adds or removes validation settings on target fields.
     *
     * @example
     * ```javascript
     * await LFForm.validateFields({ fieldId: 110 }, { required: true });
     * ```
     */
    validateFields: (
      id: LFFormIdParam,
      validationOptions: { required: boolean },
    ) => Promise<LFFormPromiseResponse>;
  };
