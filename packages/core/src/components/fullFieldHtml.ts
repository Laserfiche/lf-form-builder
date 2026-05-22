import { LFFormField, LFFormId } from '@lf/lf-form-types';

export type FullFieldHtmlOptions = {
  styles?: string;
  id?: string;
  zIndex?: number;
  classes?: string
};
export const generateFullFieldHtml = (
  content: string | null,
  { styles = '', id = '', zIndex = 10, classes }: FullFieldHtmlOptions = {},
) => {
  return content
    ? /* html */ `
<div
  ${id ? `id="${id}"` : ''}
  style="position: absolute;
        top: 0;
        left: 0;
        display: flex;
        width: 100%;
        z-index: ${zIndex};
        height: 100%;${styles}"
  class="${classes || ''}"
>
  ${content} 
</div>
`
    : '';
};
/**
 * Automatically sets a full field HTML content above or below the field.
 * Passes the content embedded in a div with absolute positioning.
 * @param {LFFormId | LFFormField} formField
 * @param {'textAbove' | 'textBelow' | 'description' | 'subtext'} placement
 * @param {string} content
 * @param {FullFieldHtmlOptions} options
 * @returns {Promise<void>}
 * @preserve docs
 */
export const fullFieldHtml = async (
  formField: LFFormId | LFFormField,
  placement: 'textAbove' | 'textBelow' | 'description' | 'subtext' | 'content',
  content: string | null,
  options: FullFieldHtmlOptions = {},
) => {
  const html = generateFullFieldHtml(content, options);
  await LFForm.changeFieldSettings(formField, {
    [placement]: html,
  });
};
