import type { FormFieldsType } from '.';
import { CheckboxField } from '@lf/lf-form-types';

interface CustomWindow extends Window {
  LFC: {
    handleSelectAll?: () => void;
  };
}
declare const window: CustomWindow;

window.LFC = window.LFC ?? {}

/* Register function just provided to initialize the code in this file
 * You can basically ignore this function and just read/use its contents
 */
export const registerSelectAll = (formFields: FormFieldsType) => {
  // Store fields you use at the top of your script to easily update them if anything changes
  // In this case fields are already stored in the formFields variable

  // Declare helper functions
  let isSelectAllChecked = false; // Changed to boolean
  const isSelectAllCheckedHandlerName = 'handleSelectAll';
  const registerIsSelectAllChecked = () => {
    const handleSelectAllChange: Parameters<typeof LFForm.onFieldChange>[0] = async (ev) => {
      const field = ev.options[0];
      const isCurrentChecked =
        LFForm.getFieldValues<CheckboxField>(field).value.includes('Select');
      if (isCurrentChecked !== isSelectAllChecked) {
        isSelectAllChecked = isCurrentChecked;
      }
      await LFForm.changeFieldSettings(formFields.selectRowCol, {
        label: `<input type="checkbox" onchange="LFC.handleSelectAll()" ${isSelectAllChecked ? 'checked' : ''
          } />`,
      });
    };
    LFForm.onFieldChange(
      handleSelectAllChange,
      { ...formFields.selectRowCol, handlerName: isSelectAllCheckedHandlerName },
    );
  };
  window.LFC.handleSelectAll = async () => {
    LFForm.unsubscribe('fieldChange', {
      ...formFields.selectRowCol,
      handlerName: isSelectAllCheckedHandlerName,
    });
    isSelectAllChecked = !isSelectAllChecked; // Toggle the boolean value
  
    await LFForm.setFieldValues<CheckboxField>(formFields.selectRowCol, {
      value: isSelectAllChecked ? ['Select'] : [], // Invert previous value
    });
    registerIsSelectAllChecked();
  };
}