import {
  LFFormField,
  LFFormFormPart,
  type LFFormChangeFormSettings,
} from '@lfz/lf-form-types';

/*
 * translation
 *
 * On-demand auto-translate script for a form: when `translation()` is
 * invoked it will translate all translatable field settings on the current
 * form to the specified language using a server-side translation endpoint and
 * apply them in-place.
 *
 * Usage: call `translation({ targetLang: 'es' })` or omit targetLang to
 * prompt for a language code. Set `import.meta.env.VITE_TRANSLATION_ENDPOINT`
 * to a backend route that performs translation without exposing provider keys
 * in the browser.
 */

const TRANSLATION_ENDPOINT = import.meta.env.VITE_TRANSLATION_ENDPOINT?.trim() ?? '';
const defaultFormLang = 'en';

type TranslationValue =
  | string
  | TranslationOption[]
  | Record<string, string>;

type TranslationOption = {
  label: string;
  value: string;
};

type TranslationSettings = Record<string, TranslationValue>;
type FieldTranslations = Record<string, TranslationSettings>;

const isTranslationOptionArray = (value: unknown): value is TranslationOption[] =>
  Array.isArray(value)
  && value.every(
    (item) => typeof item === 'object'
      && item !== null
      && 'label' in item
      && typeof item.label === 'string'
      && 'value' in item
      && typeof item.value === 'string',
  );

async function getTranslation(
  text: string,
  targetLang: string,
  splitTextCharacterLimit = 5000,
): Promise<string> {
  if (!TRANSLATION_ENDPOINT) return text;
  const limit = Math.min(Math.max(1, splitTextCharacterLimit), 5000);

  const chunks = text.length > limit ? splitForTranslate(text, limit) : [text];
  try {
    const translated = await Promise.all(
      chunks.map(async (chunk) => {
        const res = await fetch(TRANSLATION_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: chunk, source: defaultFormLang, target: targetLang }),
        });
        const data = await res.json();
        return data?.translatedText ?? data?.data?.translations?.[0]?.translatedText ?? chunk;
      }),
    );
    return translated.join('');
  } catch (e) {
    console.error('Translation error', e);
    return text;
  }
}

function splitForTranslate(text: string, limit = 5000) {
  const words = text.split(/(\s+)/);
  const chunks: string[] = [];
  let current = '';
  for (const w of words) {
    if (current.length + w.length > limit && current.length > 0) {
      chunks.push(current);
      current = w;
    } else {
      current += w;
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function getFormFieldSettings(): FieldTranslations {
  const result: FieldTranslations = {};
  LFForm.findFields((f: LFFormField) => {
    const settings = f.settings;
    const variableName = settings.attributeName;
    const label = settings.label;
    const keyLabel = variableName ? `${variableName} (${f.componentType})` : label ? `${label} (${f.componentType})` : `(${f.componentType})`;
    const key = `${f.fieldId} - ${keyLabel}`;

    if (f.componentType === 'Form') {
      result.Form = {
        title: (settings as LFFormFormPart['settings']).title ?? '',
        description: settings.description ?? '',
      };
      return true;
    }

    const trans: TranslationSettings = {};
    if (settings.label) trans.label = settings.label;
    if (settings.subtext) trans.subtext = settings.subtext;
    if (settings.tooltip) trans.tooltip = settings.tooltip;
    if (settings.default && typeof settings.default === 'string') trans.default = settings.default;
    if ('options' in f && isTranslationOptionArray(f.options)) {
      trans.options = f.options.map(({ label: optionLabel, value }) => ({
        label: optionLabel,
        value,
      }));
    }
    result[key] = trans;
    return true;
  });
  return result;
}

async function getFieldTranslationsForLanguage(targetLang: string): Promise<FieldTranslations> {
  const formInfo = getFormFieldSettings();
  const out: FieldTranslations = {};

  for (const key of Object.keys(formInfo)) {
    const settings = formInfo[key];
    const newSettings: TranslationSettings = {};
    for (const settingKey of Object.keys(settings)) {
      const value = settings[settingKey] as TranslationValue;
      if (typeof value === 'string') {
        newSettings[settingKey] = await getTranslation(value, targetLang);
      } else if (isTranslationOptionArray(value)) {
        const translated: TranslationOption[] = [];
        for (const opt of value) {
          translated.push({ ...opt, label: await getTranslation(opt.label, targetLang) });
        }
        newSettings[settingKey] = translated;
      } else if (typeof value === 'object' && value !== null) {
        const map: Record<string, string> = {};
        for (const propKey of Object.keys(value)) {
          const propValue = (value as Record<string, string>)[propKey];
          map[propKey] = await getTranslation(propValue, targetLang);
        }
        newSettings[settingKey] = map;
      }
    }
    out[key] = newSettings;
  }
  return out;
}

async function applyTranslations(translated: FieldTranslations) {
  let isChangeFieldOptionsSupported = true;
  for (const key of Object.keys(translated)) {
    if (key === 'Form') {
      const formSettings = translated[key];
      if (formSettings.title) {
        const changes: LFFormChangeFormSettings = { title: String(formSettings.title) };
        await LFForm.changeFormSettings(changes);
      }
      if (formSettings.description) {
        const changes: LFFormChangeFormSettings = { description: String(formSettings.description) };
        await LFForm.changeFormSettings(changes);
      }
      continue;
    }

    const id = parseInt(key.split(' - ')[0], 10);
    if (Number.isNaN(id)) continue;
    const found = LFForm.findFieldsByFieldId(id)?.[0];
    if (!found) continue;
    const fieldType = found.componentType;
    const settings = translated[key];
    for (const settingKey of Object.keys(settings)) {
      try {
        const value = settings[settingKey] as TranslationValue;
        if (settingKey === 'label' && typeof value === 'string') {
          await LFForm.changeFieldSettings({ fieldId: id }, { label: value });
        } else if (settingKey === 'subtext' && typeof value === 'string') {
          await LFForm.changeFieldSettings({ fieldId: id }, { subtext: value });
        } else if (settingKey === 'tooltip' && typeof value === 'string') {
          await LFForm.changeFieldSettings({ fieldId: id }, { tooltip: value });
        } else if (settingKey === 'title' && typeof value === 'string') {
          await LFForm.changeFieldSettings({ fieldId: id }, { label: value });
        } else if (settingKey === 'default' && typeof value === 'string' && fieldType === 'CustomHTML') {
          await LFForm.changeFieldSettings({ fieldId: id }, { default: value });
        } else if (settingKey === 'options' && isChangeFieldOptionsSupported && isTranslationOptionArray(value)) {
          await LFForm.changeFieldOptions({ fieldId: id }, value, 'replace');
        } else if (settingKey === 'options' && isChangeFieldOptionsSupported) {
          isChangeFieldOptionsSupported = false;
        } else if (settingKey === 'default' && typeof value === 'string' && fieldType !== 'CustomHTML') {
          await LFForm.setFieldValues({ fieldId: id }, value);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('Changing field options is only supported')) {
          isChangeFieldOptionsSupported = false;
        } else {
          console.error(`Failed to apply translation to field ${id} setting ${settingKey}`, e);
        }
      }
    }
  }
}

export const translation = async ({ targetLang }: { targetLang?: string } = {}) => {
  if (typeof LFForm === 'undefined') return;
  if (!TRANSLATION_ENDPOINT) {
    console.warn(
      '[translation] Translation is disabled. Configure VITE_TRANSLATION_ENDPOINT to use a server-side translation proxy.',
    );
    return;
  }
  let lang = targetLang;
  if (!lang) {
    lang = window.prompt('Enter target language code', defaultFormLang) ?? '';
  }
  lang = lang.trim();
  if (!lang || lang === defaultFormLang) return;

  const translated = await getFieldTranslationsForLanguage(lang);
  await applyTranslations(translated);
  console.log('Applied translations for', lang);
};

export default translation;