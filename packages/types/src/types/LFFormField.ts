import {
  AddressFieldSettings,
  BaseFieldSettings,
  CollectionFieldSettings,
  CustomHtmlFieldSettings,
  FileUploadFieldSettings,
  SignatureFieldSettings,
  StandardFieldSettings,
  TableFieldSettings,
} from './FieldSettings.js';

/**
 * Maps component type names to their corresponding field type definitions.
 * Used internally for type-safe field resolution.
 *
 * @remarks
 * Key names match the `componentType` string on each field (e.g. `'SingleLine'`, `'Number'`, `'DateTime'`).
 */
export type ComponentTypes = {
  SingleLine: TextField;
  Email: TextField;
  RichText: TextField;
  MultiLine: TextField;
  Number: NumberField;
  Currency: NumberField;
  DateTime: DateField;
  Geolocation: GeolocationField;
  Address: AddressField;
  Checkbox: CheckboxField;
  Radio: RadioField;
  Dropdown: DropdownField;
  Table: TableField;
  Collection: CollectionField;
  Signature: SignatureField;
  FileUpload: FileUploadField;
  CustomHTML: CustomHtmlField;
  Section: SectionField;
  Form: LFFormFormPart;
  Page: LFFormPagePart;
};
type BaseField = {
  __changeSettings: BaseFieldSettings;
  componentId: string;
  componentType: keyof ComponentTypes;
  fieldId: number;
  hidden: boolean;
  disabled: boolean;
  readonly: boolean;
  data: string;
  valueOrigin: string;
  trackId: string;
  repeatableTemplate: Record<string, BaseField>;
  lastChange: {
    timestamp: number;
    changes: [];
  };
  settings: {
    minWidth: number;
    minHeight: number;
    label: string;
    default: '';
    placeholder: '';
    padding: number;
    pattern: '';
    inputMask: '';
    description: '';
    subtext: '';
    tooltip: '';
    required: boolean;
    readOnly: boolean;
    allowQR: boolean;
    autoCompleteValues: [
      {
        label: '';
      },
    ];
    formula: {
      expression: '';
      errorType: string;
    };
    isPreviousDataPreserved: boolean;
    inputValidationMethod: string;
    id: string;
    componentType: string;
    fieldId: number;
    layout: string;
    parentId: string;
    isInCollection: boolean;
    isInTable: boolean;
    collectionId: number; // TODO: Verifiy this
    tableId: number; // TODO: Verifiy this
    ancestorReadonly: boolean;
    attributeName: string;
    attributeId: string;
    minEntry: null;
    maxEntry: null;
    minEntryAppend: null;
    maxEntryAppend: null;
  };
  validation: {
    singleLine: Record<string, never>;
  };
  CSSClasses: string[];
};
/** Value type for SingleLine, MultiLine, Dropdown, RichText, and Signature fields. */
export type SingleLineFieldValue = string;

/** Value type for Number and Currency fields. */
export type NumberLineFieldValue = number;

/**
 * Value type for DateTime fields.
 * Use `{ dateStr, timeStr }` when setting values.
 */
export type DateTimeFieldValue = {
  /** Date string in the configured format. */
  dateStr: string;
  /** Internal date-time object string. */
  dateTimeObj: string;
  /** Time string in the configured format. */
  timeStr: string;
};

/**
 * Value type for time-only fields.
 * Use `{ timeStr }` when setting values.
 */
export type TimeFieldValue = {
  /** Internal date-time object string. */
  dateTimeObj: string;
  /** Time string in the configured format. */
  timeStr: string;
};

/** Value type for Address fields with optional sub-field values. */
export type AddressFieldValue = {
  address1: string;
  address2: string;
  country: string;
  city: string;
  zipcode: string;
  province: string;
};

/** Value type for Geolocation fields. */
export type GeolocationFieldValue = {
  latitude: number;
  longitude: number;
};

/**
 * Value type for multi-select fields (Checkbox).
 * `value` is an array of selected option strings/numbers.
 */
export type MultiOptionFieldValue = {
  value: Array<string | number>;
  /** Value entered in the "Other" choice input, if applicable. */
  otherChoiceValue?: string;
};

/**
 * Value type for single-select fields (Radio).
 * `value` is the selected option string/number.
 */
export type SingleOptionFieldValue = {
  value: string | number;
  /** Value entered in the "Other" choice input, if applicable. */
  otherChoiceValue?: string;
};
/** Union of all supported get/set field value types. */
export type AllFieldValueTypes =
  | SingleLineFieldValue
  | NumberLineFieldValue
  | DateTimeFieldValue
  | TimeFieldValue
  | AddressFieldValue
  | SingleOptionFieldValue
  | MultiOptionFieldValue;

/** Text-based fields: SingleLine, Email, RichText, MultiLine. Value type is `string`. */
export type TextField = BaseField & {
  componentType: 'SingleLine' | 'Email' | 'RichText' | 'MultiLine';
  /** @ignore */
  __getValueType: SingleLineFieldValue;
  /** @ignore */
  __setValueType: SingleLineFieldValue;
  /** @ignore */
  __changeSettings: StandardFieldSettings;
};
/** Numeric fields: Number, Currency. Value type is `number`. */
export type NumberField = BaseField & {
  componentType: 'Number' | 'Currency';
  /** @ignore */
  __getValueType: NumberLineFieldValue;
  /** @ignore */
  __setValueType: NumberLineFieldValue;
};
/** DateTime field. Get returns `{ dateStr, dateTimeObj, timeStr }`, set accepts `{ dateStr, timeStr? }`. */
export type DateField = BaseField & {
  componentType: 'DateTime';
  /** @ignore */
  __getValueType: DateTimeFieldValue;
  /** @ignore */
  __setValueType: Pick<DateTimeFieldValue, 'dateStr' | 'timeStr'>;
};
/** Geolocation field. Value type is `{ latitude: number; longitude: number }`. */
export type GeolocationField = BaseField & {
  componentType: 'Geolocation';
  /** @ignore */
  __getValueType: GeolocationFieldValue;
  /** @ignore */
  __setValueType: GeolocationFieldValue;
};
/** Time-only field variant of DateTime. Get returns `{ dateTimeObj, timeStr }`, set accepts `{ timeStr }`. */
export type TimeField = BaseField & {
  componentType: 'DateTime';
  /** @ignore */
  __getValueType: TimeFieldValue;
  /** @ignore */
  __setValueType: Pick<DateTimeFieldValue, 'timeStr'>;
};
/** Address field. Value type contains sub-fields: address1, address2, city, country, province, zipcode. */
export type AddressField = BaseField & {
  componentType: 'Address';
  /** @ignore */
  __getValueType: AddressFieldValue;
  /** @ignore */
  __setValueType: AddressFieldValue;
  /** @ignore */
  __changeSettings: AddressFieldSettings;
};
/** Checkbox field (multi-select). Value type is `{ value: string[]; otherChoiceValue?: string }`. */
export type CheckboxField = BaseField & {
  componentType: 'Checkbox';
  /** @ignore */
  __getValueType: MultiOptionFieldValue;
  /** @ignore */
  __setValueType: MultiOptionFieldValue;
};
/** Radio field (single-select). Value type is `{ value: string; otherChoiceValue?: string }`. */
export type RadioField = BaseField & {
  componentType: 'Radio';
  /** @ignore */
  __getValueType: SingleOptionFieldValue;
  /** @ignore */
  __setValueType: SingleOptionFieldValue;
  options: Array<{
    label: string;
    value: string;
    checked: boolean;
  }>;
};
/** Dropdown field. Value type is `string`. */
export type DropdownField = BaseField & {
  componentType: 'Dropdown';
  /** @ignore */
  __getValueType: SingleLineFieldValue;
  /** @ignore */
  __setValueType: SingleLineFieldValue;
};
/** Table field (repeatable container). Not supported for direct get/set of values. */
export type TableField = BaseField & {
  componentType: 'Table';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: TableFieldSettings;
};
/** Collection field (repeatable container). Not supported for direct get/set of values. */
export type CollectionField = BaseField & {
  componentType: 'Collection';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: CollectionFieldSettings;
};
/** Signature field. Not supported for direct get/set of values. */
export type SignatureField = BaseField & {
  componentType: 'Signature';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: SignatureFieldSettings;
};
/** FileUpload field. Not supported for direct get/set of values. */
export type FileUploadField = BaseField & {
  componentType: 'FileUpload';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: FileUploadFieldSettings;
};
/** CustomHTML field. Content set via `content` / `default` / `HTMLContent` aliases. */
export type CustomHtmlField = BaseField & {
  componentType: 'CustomHTML';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: CustomHtmlFieldSettings;
};
/** Section field (layout container). Not supported for direct get/set of values. */
export type SectionField = BaseField & {
  componentType: 'Section';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: BaseFieldSettings;
};

export type LFFormPagePart = BaseField & {
  componentType: 'Page';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: never;
};
export type LFFormFormPart = BaseField & {
  componentType: 'Form';
  /** @ignore */
  __getValueType: never;
  /** @ignore */
  __setValueType: never;
  /** @ignore */
  __changeSettings: never;
  settings: BaseField['settings'] & {
    title: string;
  };
};

/** Union of all concrete LFForm field types. */
export type LFFormField = ComponentTypes[keyof ComponentTypes];

// Non-distributive: treats union F as a whole, so LFFormExtractComponentType<LFFormField> → keyof ComponentTypes
export type LFFormExtractComponentType<F> = [F] extends [{ componentType: infer CT extends keyof ComponentTypes }]
  ? CT
  : keyof ComponentTypes;

export type LFFormFieldValueType<FieldType extends LFFormField = LFFormField> = FieldType['__getValueType'];
export type LFFormSetFieldValueType<FieldType extends LFFormField = LFFormField> = FieldType['__setValueType'];
export type LFFormChangeFieldSettingsType<FieldType extends LFFormField = LFFormField> = FieldType['__changeSettings'];
// export type LFFormActionButtonPart = BaseField & { componentType: '' };

export type LFFormPart = LFFormPagePart | LFFormFormPart; // | LFFormActionButtonPart;

export type AllLFFormTypes = LFFormField | LFFormPart;
