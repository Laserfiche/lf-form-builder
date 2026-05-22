import type { LFFormId } from '@lfz/lf-form-types';

type FieldValueProp =
  | 'value'
  | 'otherChoiceValue'
  | 'dateStr'
  | 'timeStr'
  | 'addresss1';

const getFieldValueAsString = (
  fieldId: LFFormId,
  prop?: FieldValueProp | FieldValueProp[],
) => {
  const fieldValue = LFForm.getFieldValues(fieldId);
  const fieldValueArray = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

  return fieldValueArray.reduce((acc, value) => {
    if (typeof value === 'string') return acc + value;
    if (typeof value === 'number') return acc + String(value);
    if (typeof value === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valAsAny: any = value;
      if (prop && valAsAny && typeof valAsAny === 'object') {
        return (
          acc +
          (Array.isArray(prop)
            ? prop.map((p) => valAsAny[p]).join(', ')
            : valAsAny[prop])
        );
      }
      if ('address1' in value) {
        return acc + Object.values(value).join(', ');
      }
      if ('timeStr' in value && !('dateStr' in value)) {
        return `${acc} ${value.timeStr}`;
      }
      if ('dateStr' in value) {
        return `${acc} ${new Date(value.dateTimeObj).toLocaleString()}`;
      }
      if ('value' in value) {
        const multiValue = Array.isArray(value.value)
          ? value.value
          : [value.value];
        if (value.otherChoiceValue) {
          multiValue.push(value.otherChoiceValue);
        }
        return `${acc} ${multiValue.join('; ')}`;
      }
      throw new Error(`Unsupported value type ${value}`);
    }
    return acc;
  }, '');
};

class LFElement {
  private static watchCache: Record<string, { registered: LFFormId[] }> = {};
  /**
   *
   */
  public watchFields: LFFormId[] = [];
  private watchFieldsSetOnFirstRun = false;
  constructor(public forField: LFFormId, public prop: 'content' | 'textAbove' | 'textBelow' | 'label', public template: TemplateStringsArray, args: Array<LFFormId | string>) {

    void this.updateTemplate(template, args);
    this.registerWatchFields(template, args);
  }  

  updateTemplate = (template: TemplateStringsArray, args: Array<LFFormId | string>) => {
    const content = template.reduce((acc, str, i) => {
      if (i >= args.length) return acc + str;
      const arg = args[i];
      if (typeof arg !== 'string') {
        !this.watchFieldsSetOnFirstRun && this.watchFields.push(arg);
        return acc + str + getFieldValueAsString(arg);
      } else {
        return acc + str + arg;
      }
    }, '');
    this.watchFieldsSetOnFirstRun = true;
    console.log('update', content);
    return LFForm.changeFieldSettings(this.forField, { [this.prop]: content });
  }
  handlerName = (lfFormId: LFFormId) => `${lfFormId.fieldId ?? lfFormId.variableName ?? lfFormId.variableId}${lfFormId.index ? '-' + lfFormId.index : ''}_${this.prop}`;
  registerWatchFields = (template: TemplateStringsArray, args: Array<LFFormId | string>) => {
    this.watchFields.forEach(({fieldId}) => {
      console.log('watching', fieldId);
      const handlerName = this.handlerName({ fieldId });
      // const curCache = LFElement.watchCache[handlerName] || { registered: [] };
      
      LFForm.onFieldChange(() => {
        void this.updateTemplate(template, args);
      }, { fieldId, handlerName });
    });
  }
  unsubscribe() {
    // Unregister any field change handlers that were registered for this element
    this.watchFields.forEach((fieldRef) => {
      const handlerName = this.handlerName(fieldRef as LFFormId);
      try {
        LFForm.unsubscribe('fieldChange', { ...(fieldRef as LFFormId), handlerName });
      } catch (e) {
        // best-effort cleanup; ignore if unsubscribe fails
      }
    });

    // Clear local watch state
    this.watchFields = [];
    this.watchFieldsSetOnFirstRun = false;
  }
}

export const lfjsx =
  (forField: LFFormId, prop: 'content' | 'textAbove' | 'textBelow' | 'label') =>
  (template: TemplateStringsArray, ...args: Array<LFFormId | string>) => {
    return new LFElement(forField, prop, template, args);
  };
