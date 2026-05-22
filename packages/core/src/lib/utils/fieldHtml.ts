import type { LFFormId, TextField } from '@lfz/lf-form-types';

/**
 * setCustomHtml
 *
 * Writes the CustomHTML for a field in a host-compatible way by updating
 * both the field settings (`description`/`content`) and the field value.
 * Some LF runtimes render CustomHTML from settings, others from the field
 * value; writing both ensures consistent display across hosts.
 */
export const setCustomHtml = async (field: LFFormId, html: string) => {
  await Promise.all([
    LFForm.changeFieldSettings(field, {
      description: html,
      content: html,
    }),
    LFForm.setFieldValues<TextField>(field, html),
  ]);
};

export default setCustomHtml;
