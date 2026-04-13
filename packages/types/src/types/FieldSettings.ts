/**
 * Base field settings shared by all field types.
 *
 * @remarks
 * Several properties have aliases that resolve to the same setting:
 * - `description` ↔ `textAbove`
 * - `subtext` ↔ `textBelow`
 * - `CSSClasses` ↔ `cssClasses` ↔ `classNames`
 */
export type BaseFieldSettings = {
  /** Field label text. */
  label?: string;
  /** Description text displayed above the field. Alias: `textAbove`. */
  description?: string;
  /** Alias for {@link BaseFieldSettings.description | description}. */
  textAbove?: string;
  /** Subtext displayed below the field. Alias: `textBelow`. */
  subtext?: string;
  /** Alias for {@link BaseFieldSettings.subtext | subtext}. */
  textBelow?: string;
  /** Tooltip text shown on hover. */
  tooltip?: string;

  /** CSS classes to apply. Alias: `cssClasses`, `classNames`. */
  CSSClasses?: string[] | string;
  /** Alias for {@link BaseFieldSettings.CSSClasses | CSSClasses}. */
  cssClasses?: string[] | string;
  /** Alias for {@link BaseFieldSettings.CSSClasses | CSSClasses}. */
  classNames?: string[] | string;
};

/**
 * Settings for standard input fields (SingleLine, MultiLine, etc.).
 * Extends {@link BaseFieldSettings} with placeholder and autocomplete support.
 */
export type StandardFieldSettings = BaseFieldSettings & {
  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** Autocomplete suggestion values (SingleLine fields only). */
  autoCompleteValues?: string[];
};

/**
 * Settings for Address fields. Extends {@link BaseFieldSettings} with
 * per-sub-field visibility and label overrides.
 */
export type AddressFieldSettings = BaseFieldSettings & {
  /** Per-sub-field label and visibility overrides. */
  addressOptions?: Array<{
    /** The address sub-field to configure. */
    subField: 'address1' | 'address2' | 'city' | 'country' | 'province' | 'zipcode';
    /** Custom label for the sub-field. */
    label: string;
    /** Whether to show or hide the sub-field. */
    show: boolean;
  }>;
};

/** Settings for button-bearing fields (Signature, FileUpload). */
type ButtonFieldSettings = BaseFieldSettings & {
  /** Button label text. Alias for field-specific variants. */
  buttonLabel?: string;
};

/** Settings for Signature fields. Alias: `signButtonLabel` → `buttonLabel`. */
export type SignatureFieldSettings = ButtonFieldSettings & {
  /** Alias for {@link ButtonFieldSettings.buttonLabel | buttonLabel} on Signature fields. */
  signButtonLabel?: string;
};

/** Settings for FileUpload fields. Alias: `uploadButtonLabel` → `buttonLabel`. */
export type FileUploadFieldSettings = ButtonFieldSettings & {
  /** Alias for {@link ButtonFieldSettings.buttonLabel | buttonLabel} on FileUpload fields. */
  uploadButtonLabel?: string;
};

/**
 * Settings for CustomHTML fields.
 *
 * @remarks
 * `content`, `default`, and `HTMLContent` are aliases that all set the HTML body.
 */
export type CustomHtmlFieldSettings = BaseFieldSettings & {
  /** HTML content body. Alias: `default`, `HTMLContent`. */
  content?: string;
  /** Alias for {@link CustomHtmlFieldSettings.content | content}. */
  default?: string;
  /** Alias for {@link CustomHtmlFieldSettings.content | content}. */
  HTMLContent?: string;
};

/**
 * Settings for Collection fields.
 *
 * @remarks
 * `addButtonLabel`, `addRowButtonLabel`, and `addSetButtonLabel` are aliases.
 */
export type CollectionFieldSettings = BaseFieldSettings & {
  /** Label for the add button. Alias: `addRowButtonLabel`, `addSetButtonLabel`. */
  addButtonLabel?: string;
  /** Alias for {@link CollectionFieldSettings.addButtonLabel | addButtonLabel}. */
  addRowButtonLabel?: string;
  /** Alias for {@link CollectionFieldSettings.addButtonLabel | addButtonLabel}. */
  addSetButtonLabel?: string;
};

/** Settings for Table fields. Extends {@link CollectionFieldSettings} with row label support. */
export type TableFieldSettings = CollectionFieldSettings & {
  /** Custom row label template string. */
  rowLabels?: string;
};

/** Settings for pagination controls (prev/next buttons). */
export type PaginationFieldSettings = BaseFieldSettings & {
  /** Label for the "Previous" button. */
  prevButton?: string;
  /** Label for the "Next" button. */
  nextButton?: string;
};
