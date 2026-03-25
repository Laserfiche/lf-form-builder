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

export type ComponentTypes = {
  SingleLine: TextField;
  Email: TextField;
  RichText: TextField;
  MultiLine: TextField;
  Number: NumberField;
  Currency: NumberField;
  DateTime: DateField;
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
export type SingleLineFieldValue = string;
export type NumberLineFieldValue = number;
export type DateTimeFieldValue = {
  dateStr: string;
  dateTimeObj: string;
  timeStr: string;
};
export type TimeFieldValue = {
  dateTimeObj: string;
  timeStr: string;
};
export type AddressFieldValue = {
  address1: string;
  address2: string;
  country: string;
  city: string;
  zipcode: string;
  province: string;
};
export type MultiOptionFieldValue = {
  value: Array<string | number>;
  otherChoiceValue?: string;
};
export type SingleOptionFieldValue = {
  value: string | number;
  otherChoiceValue?: string;
};
export type AllFieldValueTypes =
  | SingleLineFieldValue
  | NumberLineFieldValue
  | DateTimeFieldValue
  | TimeFieldValue
  | AddressFieldValue
  | SingleOptionFieldValue
  | MultiOptionFieldValue;

export type TextField = BaseField & {
  componentType: 'SingleLine' | 'Email' | 'RichText' | 'MultiLine';
  __getValueType: SingleLineFieldValue;
  __setValueType: SingleLineFieldValue;
  __changeSettings: StandardFieldSettings;
};
export type NumberField = BaseField & {
  componentType: 'Number' | 'Currency';
  __getValueType: NumberLineFieldValue;
  __setValueType: NumberLineFieldValue;
};
export type DateField = BaseField & {
  componentType: 'DateTime';
  __getValueType: DateTimeFieldValue;
  __setValueType: Pick<DateTimeFieldValue, 'dateStr' | 'timeStr'>;
};
export type TimeField = BaseField & {
  componentType: 'DateTime';
  __getValueType: TimeFieldValue;
  __setValueType: Pick<DateTimeFieldValue, 'timeStr'>;
};
export type AddressField = BaseField & {
  componentType: 'Address';
  __getValueType: AddressFieldValue;
  __setValueType: AddressFieldValue;
  __changeSettings: AddressFieldSettings;
};
export type CheckboxField = BaseField & {
  componentType: 'Checkbox';
  __getValueType: MultiOptionFieldValue;
  __setValueType: MultiOptionFieldValue;
};
export type RadioField = BaseField & {
  componentType: 'Radio';
  __getValueType: SingleOptionFieldValue;
  __setValueType: SingleOptionFieldValue;
  options: Array<{
    label: string;
    value: string;
    checked: boolean;
  }>;
};
export type DropdownField = BaseField & {
  componentType: 'Dropdown';
  __getValueType: SingleLineFieldValue;
  __setValueType: SingleLineFieldValue;
};
export type TableField = BaseField & {
  componentType: 'Table';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: TableFieldSettings;
};
export type CollectionField = BaseField & {
  componentType: 'Collection';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: CollectionFieldSettings;
};
export type SignatureField = BaseField & {
  componentType: 'Signature';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: SignatureFieldSettings;
};
export type FileUploadField = BaseField & {
  componentType: 'FileUpload';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: FileUploadFieldSettings;
};
export type CustomHtmlField = BaseField & {
  componentType: 'CustomHTML';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: CustomHtmlFieldSettings;
};
export type SectionField = BaseField & {
  componentType: 'Section';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: BaseFieldSettings;
};

export type LFFormPagePart = BaseField & {
  componentType: 'Page';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: never;
};
export type LFFormFormPart = BaseField & {
  componentType: 'Form';
  __getValueType: never;
  __setValueType: never;
  __changeSettings: never;
  settings: BaseField['settings'] & {
    title: string;
  };
};

export type LFFormField = ComponentTypes[keyof ComponentTypes];

export type LFFormFieldValueType<FieldType extends LFFormField = LFFormField> = FieldType['__getValueType'];
export type LFFormSetFieldValueType<FieldType extends LFFormField = LFFormField> = FieldType['__setValueType'];
export type LFFormChangeFieldSettingsType<FieldType extends LFFormField = LFFormField> = FieldType['__changeSettings'];
// export type LFFormActionButtonPart = BaseField & { componentType: '' };

export type LFFormPart = LFFormPagePart | LFFormFormPart; // | LFFormActionButtonPart;

export type AllLFFormTypes = LFFormField | LFFormPart;
