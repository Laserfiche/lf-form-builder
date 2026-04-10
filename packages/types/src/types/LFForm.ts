import { ChangeFormSettingsType } from './FormSettings.js';
import {
  LFFormField,
  LFFormFieldValueType,
  LFFormSetFieldValueType,
  LFFormChangeFieldSettingsType,
  ComponentTypes,
} from './LFFormField.js';

export type LFFormId = {
  fieldId?: number;
  variableId?: string;
  variableName?: string;
  index?: number;
};

export type LFFormIdParam = LFFormId | LFFormId[];
export type LFFormLookupId = { lookupRuleId: number };

export type LFFormEventParamOptions = {
  handlerName?: string;
  cannotUnsubscribe?: boolean;
  fieldId?: number;
  variableId?: string;
  variableName?: string;
  componentId?: string;
  lookupRuleId?: number;
  index?: number;
};
export type LFFormEventParam = { eventName: keyof typeof LQuerySupportedEventMap } & {
  options: LFFormEventParamOptions[];
};
export type LFFormEventHandler<T = void> = (event: LFFormEventParam) => T | Promise<T>;
export type LFFormEventOptions<EventType extends LQuerySupportedEvents> = EventType extends 'lookupTrigger'
  ? {
      handlerName?: string;
      lookupRuleId: number;
    }
  : EventType extends 'lookupDone'
    ? {
        handlerName?: string;
        lookupRuleId: number;
      }
    : { handlerName?: string };
export type ActionButtonDefault = 'Submit' | 'Approve' | 'Reject';
export const LFFormSupportedEventMap = {
  formSubmission: 'formSubmission',
  lookupTrigger: 'lookupTrigger',
  lookupDone: 'lookupDone',
} as const;
export const LFFormFieldSupportedEventMap = {
  fieldChange: 'fieldChange',
  fieldBlur: 'fieldBlur',
} as const;
export const LQuerySupportedEventMap = {
  ...LFFormSupportedEventMap,
  ...LFFormFieldSupportedEventMap,
  change: 'fieldChange',
  blur: 'fieldBlur',
} as const;
export type LFFormSupportedEvents = keyof typeof LFFormSupportedEventMap;
export const isLFFormSupportedEvent = (eventName: string): eventName is LFFormSupportedEvents =>
  eventName in LFFormSupportedEventMap;
export type LFFormFieldSupportedEvents = keyof typeof LFFormFieldSupportedEventMap;
export type LQuerySupportedEvents = LFFormSupportedEvents | LFFormFieldSupportedEvents;
export type LFFormPromiseResponse = { success: true; error?: never } | { success: false; error: string };

export interface GetFieldValuess<FieldType extends LFFormField & LFFormId = LFFormField> {
  <FieldValueType extends FieldType | FieldType[]>(
    id: Partial<FieldValueType>,
  ): FieldValueType extends Array<infer TrueFieldType extends FieldType>
    ? LFFormFieldValueType<TrueFieldType>[]
    : FieldValueType extends infer TrueFieldType extends FieldType
      ? LFFormFieldValueType<TrueFieldType>
      : typeof id extends FieldType
        ? LFFormFieldValueType<typeof id>
        : never;
}

export type FormIdParam = LFFormId & {
  componentType?: keyof ComponentTypes;
  disabled?: boolean;
  settings?: {
    isInCollection?: boolean;
    isInTable?: boolean;
    readonly?: boolean;
  };
};

type SimplifyFormIdParam<T extends FormIdParam> = {
  fieldId: T['fieldId'];
  index: T['index'];
  variableId: T['variableId'];
  variableName: T['variableName'];
  componentType: T['componentType'] extends keyof ComponentTypes ? T['componentType'] : keyof ComponentTypes;
  isDisabled: T['settings'] extends { readonly: true } ? true : T['disabled'] extends true ? true : false;
  isMultiple: T['settings'] extends { isInCollection: true } | { isInTable: true } ? true : false;
};

export type GetFieldValues = <
  F extends LFFormField | LFFormField[] | unknown = unknown,
  T extends FormIdParam = FormIdParam,
>(
  id: T | T[],
) => F extends LFFormField
  ? LFFormFieldValueType<F>
  : F extends Array<infer TT extends LFFormField>
    ? LFFormFieldValueType<TT>[]
    : SimplifyFormIdParam<T>['isMultiple'] extends true
      ? LFFormFieldValueType<ComponentTypes[SimplifyFormIdParam<T>['componentType']]>[]
      : LFFormFieldValueType<ComponentTypes[SimplifyFormIdParam<T>['componentType']]>;

export type SetFieldValues = <
  FieldValType extends LFFormField | LFFormField[] = LFFormField,
  T extends FormIdParam = FormIdParam,
>(
  id: T | T[],
  value: SimplifyFormIdParam<T>['isDisabled'] extends true
    ? never
    : SimplifyFormIdParam<T>['componentType'] extends keyof ComponentTypes
      ?
          | LFFormSetFieldValueType<ComponentTypes[SimplifyFormIdParam<T>['componentType']]>
          | Array<LFFormSetFieldValueType<ComponentTypes[SimplifyFormIdParam<T>['componentType']]>>
      :
          | LFFormSetFieldValueType<ComponentTypes[SimplifyFormIdParam<FieldValType>['componentType']]>
          | Array<LFFormSetFieldValueType<ComponentTypes[SimplifyFormIdParam<FieldValType>['componentType']]>>,
) => Promise<LFFormPromiseResponse>;

export interface FindFieldsBy<Param, FieldType extends LFFormField | LFFormField[] | FormIdParam = LFFormField> {
  <FindFieldType extends FieldType | FieldType[]>(
    findBy: Param,
  ): FindFieldType extends Array<infer TT extends LFFormField> | infer TT extends LFFormField
    ? TT[]
    : ComponentTypes[SimplifyFormIdParam<FieldType>['componentType']] extends LFFormField | LFFormField[]
      ? ComponentTypes[SimplifyFormIdParam<FieldType>['componentType']][]
      : LFFormField[];
}

type LFFormProperties = {
  step: { id: string; name: string } | null;
  stage: { id: string; name: string } | null;
  language: string | null;
  locale: string | null;
  isCloud: boolean;
  isPreview: boolean;
  isReadonly: boolean;
  isDisabled: boolean;
  isPrint: boolean;
  isAnonymousUser: boolean;
  isDraft: boolean;
  pageURL: string;
};

/**
 * Represents a form in the LF Query package.
 *
 * @template FieldType - The type of the form field.
 */
export type LFForm<FieldType extends FormIdParam = FormIdParam> = LFFormProperties & {
  /**
   * Gets the value of the specified fields.
   * - If there is only one field matching an identification object, returns the data of that field.
   * - If there are multiple fields that match an identification object (fields in a collection or table, for instance), returns an array of data for all matching fields.
   * @example
   * For a single line field with a field ID of 10 and the current value of "Hello":
   * ```javascript
   * LFForm.getFieldValues({fieldId: 10}); // returns "Hello"
   * ```
   * For a repeatable field (table or collection) with 3 rows, where each row has a single line field with a field ID of 10; in row 1, the single line field has the value "a"; in row 2, the single line field has the value "b"; and in row 3, the single line field has the value "c":
   * ```javascript
   * LFForm.getFieldValues({fieldId: 10}); // will return a string array of ["a", "b", "c"].
   * LFForm.getFieldValues({fieldId: 10, index: 0}); // will return "a".
   * ```
   */
  getFieldValues: GetFieldValues;
  /**
   * Sets the value of the specified fields.
   * Note: If a field is set as read only, its value can not be changed.
   * Note: Different field types expect different values:
   * - SingleLine, MultiLine, Dropdown, RichText, and Signature fields expect a string.
   * - Number fields expect a number.
   * - Checkbox fields expect an object with a "value" property. For example: {value: ["Choice_1", "Choice_3"]}, {value: ["Choice_1", "_other"], otherChoiceValue: "Hello"}
   * - Radio button fields expect an object with a "value" property. For example: {value: "Choice 2"}, {value: "_other", otherChoiceValue: "Hi"}
   * - Geolocation fields expect an object with "latitude" and/or "longitude" properties. For example: {latidude: 12, longitude: 34}
   * - Address fields expect an object with "address1", "address2", "city", "country", "province" and/or "zipcode" properties. Example: {address1: "3545 Long Beach Blvd", city: "Long Beach", province: "California"}
   * - DateTime fields expect an object with a "dateStr" property. A "timeStr" property is optional and only applied when Show Time is enabled for the field. For example: {dateStr: "2021-11-19", timeStr: "10:30:00 AM"}
   * - Time fields expect an object with a "timeStr" property. For example: {timeStr: "11:30:25 PM"}
   * - Collection, Table, FileUpload and Fileset fields are currently not supported.
   * @example
   * For a single line with field ID 10, LFForm.setFieldValues({fieldId: 10}, "hello"); // will set the field to "hello".
   * For a table or collection with 3 rows, where each row has a single line with field ID 10:
   * ```javascript
   * LFForm.setFieldValues({fieldId: 10}, "a"); // will set single line in every row to "a".
   * LFForm.setFieldValues({fieldId: 10, index: 0}, "hello"); // will set single line in first row to "hello".
   * LFForm.setFieldValues({fieldId: 10}, ["1", "2", "3"]); // will set single line in first row to "1", second row to "2" and third row to "3".
   * ```
   */
  setFieldValues: SetFieldValues;
  /**
   *
   * @example
   * ```javascript
   * LFForm.findFields(f => f.settings.label === "First Name"); // Finds all fields whose label is "First Name".
   * LFForm.findFields(f => f.settings.required); // Finds all required fields.
   * ```
   */
  findFields: FindFieldsBy<(field: LFFormField) => boolean, FieldType>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.findFieldsByClassName("blue");
   * ```
   */
  findFieldsByClassName: FindFieldsBy<string, FieldType>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.findFieldsByFieldId(2);
   * ```
   */
  findFieldsByFieldId: FindFieldsBy<number, FieldType>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.findFieldsByVariableId("90e0b201-5268-4ace-9f65-8ac32d12b58a");
   * ```
   */
  findFieldsByVariableId: FindFieldsBy<string, FieldType>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.findFieldsByVariableName("Single_Line");
   * ```
   */
  findFieldsByVariableName: FindFieldsBy<string, FieldType>;
  /**
   * Changes settings on the specified fields. This function can affect table/collection row/set templates.
   * @example
   * ```javascript
   * LFForm.changeFieldSettings( {fieldId: 10}, {label: "New Label", description: "New Description", subtext: "New Subtext", tooltip: "New Tooltip", placeholder: "New Placeholder"} );
   * LFForm.changeFieldSettings( [{variableName: "Single_Line"}, {variableName: "Single_Line_1"}], {autoCompleteValues: ["one", "two", "three"]} );
   * LFForm.changeFieldSettings( {fieldId: 12}, {content: "<a src='https://www.laserfiche.com'>Laserfiche</a>"} );
   * LFForm.changeFieldSettings({fieldId: 10}, {CSSClasses: "red solidBorder"});
   * LFForm.changeFieldSettings({fieldId: 10}, {CSSClasses: ["blue", "noBorder"]});
   * LFForm.changeFieldSettings( {fieldId: 10}, {buttonLabel: "Upload"} );
   * LFForm.changeFieldSettings( {fieldId: 10}, {rowLabels: ["First {n}", "Second {n}", "Third {n}"]} );
   * LFForm.changeFieldSettings( {fieldId: 10}, {rowLabels: "Row {n}"} );
   * LFForm.changeFieldSettings( {fieldId: 10}, {addButtonLabel: "+ Add Row"} );
   * LFForm.changeFieldSettings( {fieldId: 10}, {label: "First Page", prevButton: "Back", nextButton: "Forward"} );
   * LFForm.changeFieldSettings( {fieldId: 10}, {addressOptions: [{subField: "address1", label: "Address"}, {subField: "address2", show: false}, {subField: "city", label: "City"}, {subField: "province", label: "State"}, {subField: "zipcode", label: "Zip Code", show: true}, {subField: "country", show: false}]} );
   * ```
   */
  changeFieldSettings: <FieldSettingType extends FormIdParam = FormIdParam>(
    id: LFFormIdParam,
    changes: LFFormChangeFieldSettingsType<ComponentTypes[SimplifyFormIdParam<FieldSettingType>['componentType']]>,
  ) => Promise<LFFormPromiseResponse>;
  /**
   * **Only supported in self hosted systems**
   * @param id identifier of the field to change
   * @param changes changes to apply to the field
   * @param mode mode of the change @default 'replace'
   */
  changeFieldOptions: (
    id: LFFormIdParam,
    changes: { label?: string; value?: string; selected?: boolean }[],
    mode?: 'add' | 'remove' | 'replace',
  ) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.changeFormSettings({title: "New Form Title", description: "New Form Description"});
   * LFForm.changeFormSettings({pagination: [{pageId: 1, label: "First Page"}, {pageId: 2, label: "Second Page", prevButton: "Back", nextButton: "Forward"}]});
   * ```
   */
  changeFormSettings: (changes: ChangeFormSettingsType) => Promise<LFFormPromiseResponse>;
  /**
   * Disables the specified fields. This function can affect table/collection row/set templates.
   * @example
   * ```javascript
   * LFForm.disableFields({fieldId: 10});
   * LFForm.disableFields([{fieldId: 3, index: 1}, {fieldId: 3, index: 3}]);
   * LFForm.disableFields({fieldId: 3, index: 1}, {fieldId: 3, index: 3});
   * ```
   */
  disableFields: (id: LFFormIdParam, ...ids: LFFormId[]) => Promise<LFFormPromiseResponse>;
  /**
   * Enables the specified fields. This function can affect table/collection row/set templates.
   * @example
   * ```javascript
   * LFForm.enableFields({fieldId: 10});
   * LFForm.enableFields([{fieldId: 3, index: 1}, {fieldId: 3, index: 3}]);
   * LFForm.enableFields({fieldId: 3, index: 1}, {fieldId: 3, index: 3});
   * ```
   */
  enableFields: (id: LFFormIdParam, ...ids: LFFormId[]) => Promise<LFFormPromiseResponse>;
  /**
   * Shows the specified fields. This function can affect table/collection row/set templates.
   * @example
   * ```javascript
   * LFForm.showFields({fieldId: 10}); //will show the field with an ID of 10.
   * LFForm.showFields([{fieldId: 3, index: 1}, {fieldId: 3, index: 3}]); // uses an array to show the second and fourth rows or sets in the table or collection with the ID of 3.
   * LFForm.showFields({fieldId: 3, index: 1}, {fieldId: 3, index: 3}); // uses two ID objects .
   * ```
   */
  showFields: (id: LFFormIdParam, ...ids: LFFormId[]) => Promise<LFFormPromiseResponse>;
  /**
   * Hides the specified fields. This function can affect table/collection row/set templates.
   * @example
   * ```javascript
   * LFForm.hideFields({fieldId: 10});
   * LFForm.hideFields([{fieldId: 3, index: 1}, {fieldId: 3, index: 3}]);
   * LFForm.hideFields({fieldId: 3, index: 1}, {fieldId: 3, index: 3});
   * ```
   */
  hideFields: (id: LFFormIdParam, ...ids: LFFormId[]) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.addRow({variableName: "Expense_Table"}, 3);
   * ```
   */
  addRow: (id: LFFormIdParam, count: number) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.addSet({variableName: "Info_Collection"}, 2);
   * ```
   */
  addSet: (id: LFFormIdParam, count: number) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.deleteRow({variableName: "Expense_Table"}, 0); // Deletes the first row of Expense_Table.
   * ```
   */
  deleteRow: (id: LFFormIdParam, ...index: number[]) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.deleteSet({variableName: "Info_Collection"}, 0, 1, 2); // Deletes the first 3 sets of the Info_Collection.
   * ```
   */
  deleteSet: (id: LFFormIdParam, ...index: number[]) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.addCSSClasses({fieldId: 1}, "red"); // adds class "red" to fields with fieldId 1.
   * LFForm.addCSSClasses([{fieldId: 1}, {fieldId: 2}], "red solidBorder"); // adds classes "red" and "solidBorder" to fields with fieldId 1 and 2.
   * LFForm.addCSSClasses([{fieldId: 1}, {fieldId: 2}], ["red", "solidBorder"]); // adds classes "red" and "solidBorder" to fields with fieldId 1 and 2.
   * ```
   */
  addCSSClasses: (id: LFFormIdParam, classes: string | string[]) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.removeCSSClasses({fieldId: 1}, "red"); // removes class "red" from fields with fieldId 1.
   * LFForm.removeCSSClasses([{fieldId: 1}, {fieldId: 2}], "red solidBorder"); // removes classes "red" and "solidBorder" from fields with fieldId 1 and 2.
   * LFForm.removeCSSClasses([{fieldId: 1}, {fieldId: 2}], ["red", "solidBorder"]); // removes classes "red" and "solidBorder" from fields with fieldId 1 and 2.
   * ```
   */
  removeCSSClasses: (id: LFFormIdParam, classes: string | string[]) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * ```
   */
  getLaserficheAPIClient: <T>(client: string) => Promise<T>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.changeActionButton("Submit", {label: "New Submit"});
   * ```
   */
  changeActionButton: (
    buttonName: ActionButtonDefault | string,
    actionButtonInfo: { label: string },
  ) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.changeActionButtons([{action: "Submit", label: "New Submit"}, {action: "Approve", label: "New Approve"}]);
   * ```
   */
  changeActionButtons: (
    actionButtonsToChange: Array<{
      action: ActionButtonDefault | string;
      label: string;
    }>,
  ) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.validateFields({fieldId: 2}, {"required": true});
   * ```
   */
  validateFields: (id: LFFormIdParam, validationOptions: { required: boolean }) => Promise<LFFormPromiseResponse>;
  /**
   *
   * @example
   * ```javascript
   * LFForm.subscribe("fieldChange", () => { console.log("change"); }, {variableName: "Single_Line"});
   * LFForm.subscribe("formSubmission", () => { console.log("submitting"); }, {handlerName: "printSubmission"});
   * ```
   */
  subscribe: (
    eventName: LQuerySupportedEvents,
    handler: LFFormEventHandler,
    options: LFFormIdParam & LFFormEventOptions<typeof eventName>,
  ) => void;
  /**
   *
   * @example
   * ```javascript
   * LFForm.unsubscribe("fieldChange", {variableName: "Single_Line"});
   * LFForm.unsubscribe("formSubmission", {handlerName: "printSubmission"});
   * ```
   */
  unsubscribe: (
    eventName: LQuerySupportedEvents,
    options: LFFormIdParam & LFFormEventOptions<typeof eventName>,
  ) => void;
  /**
   *
   * @example
   * ```javascript
   * LFForm.onFieldChange(() => console.log("change"), {variableName: "Single_Line"});
   * ```
   */
  onFieldChange: (handler: LFFormEventHandler, options: LFFormIdParam & LFFormEventOptions<'fieldChange'>) => void;
  /**
   *
   * @example
   * ```javascript
   * LFForm.onFieldBlur(() => console.log("blur"), {variableName: "Single_Line"});
   * ```
   */
  onFieldBlur: (handler: LFFormEventHandler, options: LFFormIdParam & LFFormEventOptions<'fieldBlur'>) => void;
  /**
   *
   * @example
   * ```javascript
   * LFForm.onFormSubmission(function () {
   *   if (LFForm.getFieldValues({fieldId: 3}) === "ERROR") {
   *     return {error: "Please fix the error before submitting."};
   *   }
   * });
   * LFForm.onFormSubmission(async function (event) {
   *   // Get the value of the clicked submission button
   *   const userAction = event.data.action.value;
   *   const approvalComments = LFForm.getFieldValues({ fieldId: 2});
   *   if (userAction === "Reject" && approvalComments === "") {
   *     await LFForm.showFields({ fieldId: 2 });
   *     return {error: "Please add comments in order to approve."};
   *   } else {
   *     await LFForm.hideFields({ fieldId: 2 });
   *   }
   * });
   * ```
   */
  onFormSubmission: (
    handler: LFFormEventHandler<{ error: string } | void>,
    options?: LFFormEventOptions<'formSubmission'>,
  ) => void;
  /**
   *
   * @example
   * ```javascript
   * LFForm.onLookupTrigger(function () {
   *   if (LFForm.getFieldValues({variableName: "TriggerField"}) === "NoCall") {
   *     return {cancelLookup: true};
   *   }
   * }, {lookupRuleId: 3}); // When lookup rule 3 is triggered,
   *                        // if field with variable name "TriggerField" has value of "NoCall",
   *                        // cancel the lookup call.
   * ```
   */
  onLookupTrigger: (handler: LFFormEventHandler, options: LFFormLookupId & LFFormEventOptions<'lookupTrigger'>) => void;
  /**
   *
   * @example
   * ```javascript
   * LFForm.onLookupDone(function () {
   *   if (LFForm.getFieldValues({variableName: "Lookup_Target"}) === "Hello") {
   *     LFForm.setFieldValues({variableName: "Lookup_Target_AutoComplete"}, "World!");
   *   }
   * }, {lookupRuleId: 2}); // after lookup rule 2 is done, check for Lookup_Target value.
   *                        // If it is "Hello", set the Lookup_Target_AutoComplete to "World!"
   * ```
   */
  onLookupDone: (handler: LFFormEventHandler, options: LFFormLookupId & LFFormEventOptions<'lookupDone'>) => void;
};
