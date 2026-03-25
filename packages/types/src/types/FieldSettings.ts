export type BaseFieldSettings = {
  label?: string;
  description?: string;
  textAbove?: string;
  subtext?: string;
  textBelow?: string;
  tooltip?: string;

  CSSClasses?: string[] | string;
  cssClasses?: string[] | string;
  classNames?: string[] | string;
};
export type StandardFieldSettings = BaseFieldSettings & {
  placeholder?: string;
  autoCompleteValues?: string[];
};

export type AddressFieldSettings = BaseFieldSettings & {
  addressOptions?: Array<{
    subField: 'address1' | 'address2' | 'city' | 'country' | 'province' | 'zipcode';
    label: string;
    show: boolean;
  }>;
};
type ButtonFieldSettings = BaseFieldSettings & {
  buttonLabel?: string;
};

export type SignatureFieldSettings = ButtonFieldSettings & {
  signButtonLabel?: string;
};

export type FileUploadFieldSettings = ButtonFieldSettings & {
  uploadButtonLabel?: string;
};

export type CustomHtmlFieldSettings = BaseFieldSettings & {
  content?: string;
  default?: string;
  HTMLContent?: string;
};

export type CollectionFieldSettings = BaseFieldSettings & {
  addButtonLabel?: string;
  addRowButtonLabel?: string;
  addSetButtonLabel?: string;
};

export type TableFieldSettings = CollectionFieldSettings & {
  rowLabels?: string;
};

export type PaginationFieldSettings = BaseFieldSettings & {
  prevButton?: string;
  nextButton?: string;
};
