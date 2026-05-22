import { LFFormField, LFFormFormPart, RadioField } from '@lf/lf-form-types';

interface CustomWindow extends Window {
  getFormFieldSettings: typeof getFormFieldSettings;
  getFieldTranslations: typeof getFieldTranslations;
  openTranslation: () => void;
  resetForm: () => void;
}
declare const window: CustomWindow;

// Statically saved translations
interface ActionButtons {
  Submit?: string;
  Approve?: string;
  Reject?: string;
  SaveAsDraft?: string;
  [key: string]: string | undefined;
}

interface AddressOption {
  label: string;
  value: string;
  [key: string]: unknown;
}

interface FieldOption {
  label: string;
  value: string;
  checked?: boolean;
  showVal?: boolean;
  [key: string]: unknown;
}

interface AddressValue {
  [key: string]: string;
}

type TranslationValue =
  | string
  | FieldOption[]
  | AddressOption[]
  | AddressValue
  | ActionButtons;

interface TranslationSettings {
  title?: string;
  description?: string;
  label?: string;
  subtext?: string;
  tooltip?: string;
  default?: string | AddressValue;
  options?: FieldOption[];
  actionButtons?: ActionButtons;
  prevBtn?: string;
  nextBtn?: string;
  signButtonLabel?: string;
  rowLabels?: string;
  addLinkText?: string;
  buttonLabel?: string;
  addressOptions?: AddressOption[];
  [key: string]: TranslationValue | undefined;
}

interface FieldTranslations {
  [fieldId: string]: TranslationSettings;
}

interface LanguageSettings {
  [languageCode: string]: FieldTranslations;
}
/**
 * @type {{ [languageCode: string]: { [fieldId: string]: { [setting: string]: string } } }}
 * @description This is where you can statically save translations.
 * The first key is the language code, e.g., en, fr, es, etc.
 * The second key is the field id.
 * The third key is the field setting, e.g., label, subtext, tooltip, etc.
 */
const translations: LanguageSettings = {
  en: {
    Form: {
      title: 'New Employee Information',
      description:
        'Please fill in the following form to the best of your ability',
      actionButtons: {
        Submit: 'Submit',
        Approve: 'Approve',
        Reject: 'Reject',
        SaveAsDraft: 'Save as Draft',
      },
    },
    '0 - Basic Information (Page)': {
      label: 'Basic Information',
      nextBtn: 'Work History',
    },
    '3 - Work History (Page)': {
      label: 'Work History',
      prevBtn: 'Basic Information',
      nextBtn: 'Acknowledgement',
    },
    '4 - Acknowledgement (Page)': {
      label: 'Acknowledgement',
      prevBtn: 'Work History',
      nextBtn: 'Submit',
    },
    '2 - Select_a_Language (Radio)': {
      label: 'Select a Language',
      subtext: '',
      options: [
        {
          label: 'English',
          value: 'en',
          checked: true,
          showVal: true,
        },
        {
          label: 'Spanish',
          value: 'es',
          checked: false,
          showVal: true,
        },
      ],
      tooltip: '',
    },
    '16 - (CustomHTML)': {
      default:
        '\u003Cdiv\u003E\n  \u003Cfont style="font-weight: 600;     text-decoration: underline;"\u003E\n    Instructions\n  \u003C/font\u003E\n  \u003Cul\u003E\n    \u003Cli\u003E\n      Fill the form completely\n    \u003C/li\u003E\n    \u003Cli\u003E\n      Press Submit\n    \u003C/li\u003E\n  \u003C/ul\u003E\n\u003C/div\u003E',
    },
  },
  es: {
    Form: {
      title: 'Información de nuevos empleados',
      description:
        'Por favor complete el siguiente formulario lo mejor que pueda',
      actionButtons: {
        Submit: 'Entregar',
        Approve: 'Aprobar',
        Reject: 'Rechazar',
        SaveAsDraft: 'Guardar como borrador',
      },
    },
    '0 - Basic Information (Page)': {
      label: 'Información básica',
      nextBtn: 'Historial de trabajo',
    },
    '3 - Work History (Page)': {
      label: 'Historial de trabajo',
      prevBtn: 'Información básica',
      nextBtn: 'Reconocimiento',
    },
    '4 - Acknowledgement (Page)': {
      label: 'Reconocimiento',
      prevBtn: 'Historial de trabajo',
      nextBtn: 'Entregar',
    },
    '2 - Select_a_Language (Radio)': {
      label: 'Selecciona un idioma',
      subtext: '',
      options: [
        {
          label: 'Inglés',
          value: 'en',
          checked: true,
          showVal: true,
        },
        {
          label: 'Español',
          value: 'es',
          checked: false,
          showVal: true,
        },
      ],
      tooltip: '',
    },
    '16 - (CustomHTML)': {
      default:
        '\u003Cdiv\u003E\u003Cfont style="font-weight: 600;     text-decoration: underline;"\u003EInstrucciones\u003C/font\u003E\u003Cul\u003E\u003Cli\u003E Llene el formulario completamente\u003C/li\u003E\u003Cli\u003E Presione Enviar\u003C/li\u003E\u003C/ul\u003E\u003C/div\u003E',
    },
  },
};
/**
 * The field id of the language field, in this case a radio field
 * Value of the radio field is the language code
 * E.g., en, fr, es, etc.
 */
const translateLangFieldId = 2;
// The default language the form is written in. This helps avoid unnecessary translation on form load.
const defaultFormLang = 'en';
/**
 * Whether or not to translate on load i.e., save to repository tasks or subsequent approval forms
 * NOTE: you can make this dynamic by checking the form's metadata or other conditions.
 * const supportTranslationOnFormLoad = LFForm.isPrint === true; // Support print and save to repository tasks
 * @preserve
 */
const supportTranslationOnFormLoad = false;
// Server-side translation endpoint used to generate draft translations
// without exposing provider credentials in the browser.
const TRANSLATION_ENDPOINT = import.meta.env.VITE_TRANSLATION_ENDPOINT?.trim() ?? '';

// If it is being used, this is the field id of the custom html helper
const translateCustomHtmlFieldId = 1;

/**
 * DO NOT MODIFY THE BELOW CODE UNLESS YOU KNOW WHAT YOU ARE DOING
 */
/**
 *
 */
let isTranslationSupported = true;
let isTranslationHelperNeeded = false;
if (Object.keys(translations).length === 0) {
  void (async () => {
    isTranslationSupported = false;
    const translationError = `Form Translation Error:
  No translations found. Please have an admin setup translations.`;
    console.error(
      translationError.concat('\n See https://docs.laserfiche.com'),
    );
    await LFForm.changeFieldSettings(
      { fieldId: translateLangFieldId },
      { description: translationError },
    );
    await LFForm.disableFields({ fieldId: translateLangFieldId });
    const translateCustomHtmlField = LFForm.findFieldsByFieldId(
      translateCustomHtmlFieldId,
    )?.[0];
    if (
      translateCustomHtmlField !== undefined &&
      translateCustomHtmlField.componentType === 'CustomHTML'
    ) {
      await LFForm.changeFieldSettings(
        { fieldId: translateCustomHtmlFieldId },
        {
          content: `<div class="btn-container">
          <button ${
            TRANSLATION_ENDPOINT === '' ? 'disabled' : ''
          } class="btn btn-default" onclick="getFieldTranslations()" title="Generate translations using the configured server endpoint">
            Generate Translation Draft
          </button>
          <button class="btn btn-default" onclick="getFieldTranslations(true)" title="Generate an empty translation JSON">
            Custom Translation
          </button>
        </div>
        `,
        },
      );
      await LFForm.showFields({ fieldId: translateCustomHtmlFieldId });
      isTranslationHelperNeeded = true;
    }
  })();
}

const main = async () => {
  if (!isTranslationSupported) return;

  let targetLang = LFForm.getFieldValues<RadioField>({
    fieldId: translateLangFieldId,
  }).value as string;
  /**
   *
   * @param {string} newTargetLang
   * @returns {Promise<void>}
   */
  const runTranslateFields = async (newTargetLang: string) => {
    if (targetLang === newTargetLang) return;
    targetLang = newTargetLang;
    const translationTarget = translations[targetLang] || {};
    let isChangeFieldOptionsSupported = true;
    for (const field in translationTarget) {
      const translation = translationTarget[field];
      const fieldId = parseInt(field.split(' - ')[0]);
      const fieldType = /\((\w+)\)$/.exec(field)?.[1];
      if (fieldType === undefined) {
        console.warn('Malformed field name', field, 'missing field type');
        continue;
      }
      for (const setting in translation) {
        const text = translation[setting];
        if (typeof text !== 'string') {
          console.error(
            'Malformed translation, expected string for',
            field,
            setting,
            text,
          );
          continue;
        }
        if (field === 'Form') {
          await setFormSettings(setting, text).catch((e) => console.error(e));
        } else {
          await setFieldSettings(
            fieldId,
            setting as TranslatableFieldSettings,
            text,
            fieldType as LFFormField['componentType'],
            isChangeFieldOptionsSupported,
          ).catch((e) => {
            if (
              e.message ===
              'Changing field options is only supported on self-hosted Forms.'
            ) {
              isChangeFieldOptionsSupported = false;
            } else {
              console.error(
                `Error setting field ${fieldId} setting ${setting}`,
                e,
              );
            }
          });
        }
      }
    }
  };
  // Run translation when language field is changed.
  // NOTE: on field change does not natively support async so we need to disable the field while we run the translation.
  LFForm.onFieldChange(
    async () => {
      await LFForm.disableFields({ fieldId: translateLangFieldId });
      const newTargetLang = LFForm.getFieldValues<RadioField>({
        fieldId: translateLangFieldId,
      }).value as string;
      await runTranslateFields(newTargetLang);
      await LFForm.enableFields({ fieldId: translateLangFieldId });
    },
    { fieldId: translateLangFieldId },
  );

  // Run translation on form load if the language default is not in the default language.
  if (
    targetLang === defaultFormLang ||
    targetLang === null ||
    targetLang === '' ||
    !supportTranslationOnFormLoad
  )
    return;
  const initLang = targetLang;
  targetLang = defaultFormLang;
  await runTranslateFields(initLang);
};
// Run the main function on load
void main();
// #region Field settings
const basicTranslatableFieldSettings = {
  label: 'label',
  subtext: 'subtext',
  description: 'description',
  options: 'options',
  tooltip: 'tooltip',
  default: 'default',
  signButtonLabel: 'signButtonLabel',
  rowLabels: 'rowLabels',
  prevBtn: 'prevBtn',
  nextBtn: 'nextBtn',
} as const;

const otherTranslatableFieldSettings = {
  addLinkText: 'addLinkText',
  buttonLabel: 'buttonLabel',
  addressOptions: 'addressOptions',
} as const;
/**
 * @typedef {keyof typeof basicTranslatableFieldSettings | keyof typeof otherTranslatableFieldSettings} TranslatableFieldSettings
 */
type TranslatableFieldSettings =
  | keyof typeof basicTranslatableFieldSettings
  | keyof typeof otherTranslatableFieldSettings;
/**
 * @param {number} fieldId
 * @param {TranslatableFieldSettings} setting
 * @param {string} text
 * @param {LFFormField['componentType']} fieldType
 * @param {boolean} isChangeFieldOptionsSupported
 * @returns {Promise<void>}
 */
async function setFieldSettings(
  fieldId: number,
  setting: TranslatableFieldSettings,
  text: unknown,
  fieldType: LFFormField['componentType'],
  isChangeFieldOptionsSupported: boolean,
): Promise<void> {
  if (text === null || text === undefined) return;
  if (
    setting === 'default' &&
    fieldType !== 'CustomHTML' &&
    typeof text === 'string'
  ) {
    await LFForm.setFieldValues({ fieldId }, text);
  } else if (
    (typeof text === 'string' && setting === 'label') ||
    setting === 'subtext' ||
    setting === 'tooltip' ||
    setting === 'default' ||
    setting === 'signButtonLabel' ||
    setting === 'rowLabels' ||
    setting === 'prevBtn' ||
    setting === 'nextBtn'
  ) {
    const parsedSetting =
      setting === 'prevBtn'
        ? 'prevButton'
        : setting === 'nextBtn'
          ? 'nextButton'
          : setting;
    await LFForm.changeFieldSettings({ fieldId }, { [parsedSetting]: text });
  } else if (setting === 'addLinkText' && typeof text === 'string') {
    await LFForm.changeFieldSettings({ fieldId }, { addRowButtonLabel: text });
  } else if (setting === 'buttonLabel' && typeof text === 'string') {
    await LFForm.changeFieldSettings({ fieldId }, { uploadButtonLabel: text });
  } else if (setting === 'addressOptions') {
    if (Array.isArray(text)) {
      await LFForm.changeFieldSettings(
        { fieldId },
        { addressOptions: text },
      ).catch(() => {
        throw new Error(`Malformed address options for fieldId: ${fieldId}`);
      });
    } else {
      throw new Error('Address options must be an array of objects');
    }
  } else if (isChangeFieldOptionsSupported && setting === 'options') {
    if (Array.isArray(text) === false) {
      throw new Error('Change options text must be an array');
    }
    await LFForm.changeFieldOptions({ fieldId }, text, 'replace').catch(() => {
      throw new Error(`Malformed options for fieldId: ${fieldId}`);
    });
  } else {
    console.error('unknown field setting', fieldId, setting, text);
  }
}
/**
 * @param {'title' | 'description' | 'actionButtons' | string} setting
 * @param {unknown} text
 * @returns {Promise<void>}
 */
async function setFormSettings(
  setting: 'title' | 'description' | 'actionButtons' | string,
  text: unknown,
): Promise<void> {
  if (text === null || text === undefined) return;
  if (setting === 'title' && typeof text === 'string') {
    await LFForm.changeFormSettings({ title: text });
  } else if (setting === 'description' && typeof text === 'string') {
    await LFForm.changeFormSettings({ description: text });
  } else if (setting === 'actionButtons' && text && typeof text === 'object') {
    const parsedSetting = text as Record<string, string>;
    const actionButtons = Object.keys(parsedSetting).map((key) => ({
      action: key,
      label: parsedSetting[key],
    }));
    await LFForm.changeActionButtons(actionButtons);
  } else {
    console.error('unknown form setting', setting, text);
  }
}
// #endregion Field settings

// #region Translation Helpers

/**
 * @returns {FieldTranslations}
 */
const getFormFieldSettings = (): FieldTranslations => {
  const formFieldSettings: FieldTranslations = {};

  LFForm.findFields((f: LFFormField) => {
    const { settings } = f;
    const fieldSettings: TranslationSettings = {};

    const variableName = f.settings.attributeName;
    const label = f.settings.label;
    const fieldKeyLabel = variableName
      ? `${variableName} (${f.componentType})`
      : label
        ? `${f.settings.label} (${f.componentType})`
        : `(${f.componentType})`;
    const fieldIdKey = `${f.fieldId} - ${fieldKeyLabel}`;

    if (
      f.componentType === 'CustomHTML' &&
      f.fieldId === translateCustomHtmlFieldId
    ) {
      // do not translate the translation helper
      return true;
    } else if (f.componentType === 'Form') {
      fieldSettings.title = (settings as LFFormFormPart['settings']).title;
      fieldSettings.description = settings.description;
      fieldSettings.actionButtons = {
        Submit: 'Submit',
        Approve: 'Approve',
        Reject: 'Reject',
        SaveAsDraft: 'Save as Draft',
      };
      formFieldSettings['Form'] = fieldSettings;
    } else {
      for (const translatable in {
        ...basicTranslatableFieldSettings,
        ...otherTranslatableFieldSettings,
      }) {
        const translatableSetting =
          settings[translatable as keyof typeof settings];
        if (translatableSetting === undefined) continue;
        if (
          translatable === 'default' &&
          (f.componentType === 'Checkbox' ||
            f.componentType === 'Radio' ||
            f.componentType === 'Dropdown')
        ) {
          continue;
        }
        if (translatableSetting !== undefined) {
          fieldSettings[translatable as keyof TranslationSettings] =
            translatableSetting as TranslationValue;
        }
      }
      formFieldSettings[fieldIdKey] = fieldSettings;
    }
    return true;
  });
  return formFieldSettings;
};
window.getFormFieldSettings = getFormFieldSettings;

/**
 * Splits text into chunks for translation while preserving gap information.
 * @param {string} text - The long string to split.
 * @param {number} limit - Character limit (5000 is recommended).
 * @returns {Array} Array with alternating chunks and gaps between them.
 */
function splitForTranslate(text: string, limit = 5000) {
  const words = text.split(/(\s+)/); // Split on whitespace but preserve it
  const chunks: string[] = [];
  let currentChunk = '';

  words.forEach((word) => {
    // Check if adding this word exceeds the limit
    if (currentChunk.length + word.length > limit && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk += word;
    }
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Asynchronously translates text to the target language using a server-side translation endpoint and returns a Promise.
 * If translation fails, the original text is returned as a fallback.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., 'en', 'es').
 * @param {number} splitTextCharacterLimit - Character limit for splitting text (default is 5000).
 * @returns {Promise<string>} A Promise that resolves to the translated text, or the original text if translation fails.
 * @description Translate text to target language through a backend endpoint. This should be removed from your code when a static translation is saved to the translations variable.
 */
async function getTranslation(
  text: string,
  targetLang: string,
  splitTextCharacterLimit: number = 5000,
): Promise<string> {
  if (TRANSLATION_ENDPOINT === '') {
    throw new Error(
      'Translation endpoint is not configured. Set VITE_TRANSLATION_ENDPOINT to a server-side translation proxy.',
    );
  }
  const sourceLang = defaultFormLang;
  const charLimit =
    splitTextCharacterLimit > 5000 || splitTextCharacterLimit <= 0
      ? 5000
      : splitTextCharacterLimit;
  const textToTranslate =
    text.length > charLimit ? splitForTranslate(text, charLimit) : [text];
  try {
    const translatedChunks = await Promise.all(
      textToTranslate.map((chunk) => {
        const translateChunk = async (retryCount = 0): Promise<string> => {
          try {
            const response = await fetch(TRANSLATION_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                q: chunk,
                source: sourceLang,
                target: targetLang,
              }),
            });
            const data = await response.json();
            if (
              !data ||
              (typeof data.translatedText !== 'string' &&
                (!data.data || !data.data.translations || !data.data.translations[0]))
            ) {
              throw new Error('Translation API did not return expected data');
            }
            return data.translatedText ?? data.data.translations[0].translatedText;
          } catch (error) {
            if (retryCount >= 3) {
              console.error(`Failed to translate chunk after 3 retries:`, error);
              throw new Error('Failed to translate chunk');
            }
            console.error(`Error translating chunk (retry ${retryCount}):`, error);
            // Exponential backoff: 1000ms, 2000ms, 4000ms
            const delay = 1000 * Math.pow(2, retryCount);
            return new Promise<string>((resolve, reject) => {
              setTimeout(() => {
                translateChunk(retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              }, delay);
            });
          }
        };
        return translateChunk();
      }),
    );
    // Join the translated chunks back together (no delimiter needed - spacing preserved in chunks)
    return translatedChunks.join('');
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original text if translation fails
  }
}

/**
 * For each field, get the translation of the field settings.
 * This should be run once when the form is first designed, and then removed from the code.
 */
/**
 *
 * @param {string} targetLang
 * @returns {Promise<Record<string, Record<string, string>>>}
 */
const getFieldTranslationForLanguage = async (
  targetLang: string,
  generateEmptyTranslations = false,
): Promise<FieldTranslations> => {
  const formFieldInfo = getFormFieldSettings();
  const translatedForm: FieldTranslations = {};

  for (const field in formFieldInfo) {
    const fieldInfo = formFieldInfo[field];
    // get the translation for each field setting that is already setup
    const newTranslation: TranslationSettings =
      translations[targetLang]?.[field] || {};

    for (const settingKey in fieldInfo) {
      const setting = fieldInfo[settingKey];
      if (
        setting === undefined ||
        setting === '' ||
        targetLang === defaultFormLang ||
        generateEmptyTranslations === true
      ) {
        (newTranslation as Record<string, TranslationValue>)[settingKey] =
          setting as TranslationValue;
        continue;
      }

      let finalTranslation: TranslationValue | undefined;
      try {
        if (
          setting === '' ||
          setting === undefined ||
          setting === null ||
          (Array.isArray(setting) && setting?.length === 0)
        ) {
          finalTranslation = setting as TranslationValue;
        } else if (
          settingKey === 'addressOptions' ||
          (settingKey === 'default' &&
            typeof setting === 'object' &&
            !Array.isArray(setting))
        ) {
          if (settingKey === 'default' && typeof setting === 'object') {
            const addressDefaults: AddressValue = {};
            for (const label in setting) {
              if (label in setting) {
                const addressProp = (setting as Record<string, string>)[label];
                if (addressProp === '') {
                  addressDefaults[label] = '';
                  continue;
                }
                const translatedProp = await getTranslation(
                  addressProp,
                  targetLang,
                );
                addressDefaults[label] = translatedProp;
              }
            }
            finalTranslation = addressDefaults;
          } else if (Array.isArray(setting)) {
            const translatedOptions: AddressOption[] = [];
            for (const addressOption of setting) {
              const { label } = addressOption;
              const translatedLabel = await getTranslation(label, targetLang);
              translatedOptions.push({
                ...addressOption,
                label: translatedLabel,
              });
            }
            finalTranslation = translatedOptions;
          }
        } else if (settingKey === 'options' && Array.isArray(setting)) {
          const translatedOptions: FieldOption[] = [];
          for (const option of setting) {
            const label = option.label;
            const translatedOption = await getTranslation(label, targetLang);
            translatedOptions.push({ ...option, label: translatedOption });
          }
          finalTranslation = translatedOptions;
        } else if (
          settingKey === 'actionButtons' &&
          typeof setting === 'object'
        ) {
          const translatedActionButtons: ActionButtons = {};
          for (const action in setting) {
            const label = (setting as ActionButtons)[action];
            if (label) {
              const translatedLabel = await getTranslation(label, targetLang);
              translatedActionButtons[action] = translatedLabel;
            }
          }
          finalTranslation = translatedActionButtons;
        } else if (typeof setting === 'string') {
          const translatedText = await getTranslation(setting, targetLang);
          finalTranslation = translatedText;
        }

        console.log(setting, finalTranslation);
        if (finalTranslation !== undefined) {
          (newTranslation as Record<string, TranslationValue>)[settingKey] =
            finalTranslation;
        }
      } catch (e) {
        console.error(
          `Field ${field} failed to translate property ${settingKey}`,
          e,
        );
      }
    }
    translatedForm[field] = newTranslation;
  }
  return translatedForm;
};
/**
 * For each language, get the translation of the field settings.
 */
const getFieldTranslations = async (
  generateEmptyTranslations = false,
): Promise<LanguageSettings> => {
  if (!generateEmptyTranslations && TRANSLATION_ENDPOINT === '') {
    console.error(
      'Translation endpoint is not configured. Set VITE_TRANSLATION_ENDPOINT to a server-side translation proxy.',
    );
    return {};
  }
  const supportedLanguages =
    LFForm.findFieldsByFieldId<RadioField>(translateLangFieldId)[0].options;

  const translatedForm: LanguageSettings = {};
  const originalCustomHTMLContent = isTranslationHelperNeeded
    ? LFForm.findFieldsByFieldId(translateCustomHtmlFieldId)[0].data
    : '';
  if (isTranslationHelperNeeded && generateEmptyTranslations === false) {
    // display loading
    await LFForm.changeFieldSettings(
      { fieldId: translateCustomHtmlFieldId },
      {
        content: `<div class="translate-modal" style="position: fixed; z-index: 100; background: rgba(1,1,1,0.8); left: 0; top: 0; width: 100vw; height: 100vh; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div class="translate-modal-content" style="background: white; padding: 16px; flex: .75; border-radius: .75rem; width: 100%;">
          <div class="translate-modal-body" style="height: 90%">
            <div class="translate-modal-body-header">
              <h3>Translations</h3>
              <p>Please wait for translations to complete</p>
            </div>
            <div class="translate-modal-body-content" style="height: 100%">
              <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>`,
      },
    );
  }
  for (const lang of supportedLanguages) {
    const newLanguage = await getFieldTranslationForLanguage(
      lang.value,
      generateEmptyTranslations,
    );
    translatedForm[lang.value] = newLanguage;
  }
  if (isTranslationHelperNeeded) {
    const translatedFormAsString = JSON.stringify(translatedForm); //, null, 2);
    const bytes = new TextEncoder().encode(translatedFormAsString);
    const blob = new Blob([bytes], {
      type: 'application/json;charset=utf-8',
    });
    window.openTranslation = () => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    };
    window.resetForm = async () => {
      await LFForm.changeFieldSettings(
        { fieldId: translateCustomHtmlFieldId },
        { content: originalCustomHTMLContent },
      );
    };
    await LFForm.changeFieldSettings(
      { fieldId: translateCustomHtmlFieldId },
      {
        content: `<div class="translate-modal" style="position: fixed; z-index: 100; background: rgba(1,1,1,0.8); left: 0; top: 0; width: 100vw; height: 100vh; padding: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div class="translate-modal-content" style="background: white; padding: 16px; flex: .75; border-radius: .75rem; width: 100%;">
          <span class="translate-modal-close btn" style="float: right;" onclick="resetForm()">&times;</span>
          <div class="translate-modal-body" style="height: 90%">
            <div class="translate-modal-body-header">
              <h3>Translations</h3>
              <p>Click the button below to open your translations in a new tab. (Please allow popups if clicking this is blocked, or open the dev console to see the logged JSON)</p>
            </div>
            <div class="translate-modal-body-content" style="height: 100%">
              <button onclick="openTranslation()" class="btn btn-primary">Download Translations</button>
            </div>
          </div>
        </div>`,
        // <p class="user-select-all" readonly style="border: lightgray 1px solid; background: none; resize: none; height: 100%; overflow: auto; white-space: pre;">${jsonHtml.outerHTML}</p>
      },
    );
    await LFForm.showFields({ fieldId: translateCustomHtmlFieldId });
  }
  console.log(
    'Copy the following JSON into the translations variable at the start of the code.',
  );
  console.log(translatedForm);
  return translatedForm;
};
window.getFieldTranslations = getFieldTranslations;
