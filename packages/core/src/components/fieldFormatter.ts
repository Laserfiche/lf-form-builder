import { LFFormField, LFFormFieldValueType } from '@lf/lf-form-types';

interface FormatterWindow extends Window {
  handleBadgeClose: (fieldId: number) => void;
}
declare const window: FormatterWindow;
export type SupportedFieldTypes = 'Badge' | 'Tags';
export const fieldFormatter = async (
  field: LFFormField,
  type: SupportedFieldTypes,
  value: LFFormFieldValueType,
) => {
  let renderType = type;
  let renderValue: typeof value | string[] = value;
  if (type === 'Tags') {
    renderValue =
      typeof value === 'number' || typeof value === 'string'
        ? `${value}`.split(',').map((tag: string) => tag.trim())
        : value;
    renderType = 'Badge';
  }
  if (renderType === 'Badge') {
    const badgeRender = (val: string | string[]) => {
      let rV: string[] = [];
      if (val === '') {
        rV = ['New +'];
      }      else {
        rV = Array.isArray(val) ? val : [val];
      }
      return `
      <span style="position: absolute; top: 8px; left: 0px; background-color: white; width: 100%" onclick="handleBadgeClose(${
        field.fieldId
      })">
        ${rV.map(
          (v) => `<span style="font-size: 100%;"
          class="badge bg-primary custom-helptext"
        >
          ${v}
        </span>`
        ).join(' ')}
      </span>`;
    };
    await LFForm.changeFieldSettings(field, {
      subtext: Array.isArray(renderValue)
        ? badgeRender(renderValue)
        : badgeRender(renderValue.toString()),
    });
    await LFForm.disableFields(field);
    const handlerName = `Blue_BadgeFormatter_${field.fieldId}`;
    LFForm.unsubscribe('fieldBlur', { handlerName });
    LFForm.onFieldBlur(
      async () => {
        const newVal = LFForm.getFieldValues(field);
        if (newVal === '') return;
        await fieldFormatter(field, type, newVal);
      },
      { fieldId: field.fieldId, handlerName },
    );
  }
};
window.handleBadgeClose = async (fieldId) => {
  await LFForm.changeFieldSettings(
    { fieldId },
    {
      subtext: '',
    },
  );
  await LFForm.enableFields({ fieldId });
};
