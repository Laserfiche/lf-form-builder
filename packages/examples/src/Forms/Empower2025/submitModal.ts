import {
  LFFormButtonStyle,
  LFFormModal,
  LFFormModalSize,
} from '@lfz/lf-form-builder';
import type { FormFieldsType } from '.';
import { TextField } from '@lfz/lf-form-types';

/* Register function just provided to initialize the code in this file
 * You can basically ignore this function and just read/use its contents
 */
export const registerSubmitModal = (formFields: FormFieldsType) => {
  // Store fields you use at the top of your script to easily update them if anything changes
  // In this case fields are already stored in the formFields variable

  // Declare helper functions
  const getRejectionComments = () => {
    const comments = LFForm.getFieldValues<TextField>(formFields.comments);
    const dummyText = document.createElement('div');
    dummyText.innerHTML = comments;
    const value = dummyText.innerText ?? '';
    return value;
  };

  const modal = new LFFormModal(formFields.modalContainer, 'comments', {
    autoHideOnClose: true,
    size: LFFormModalSize.lg,
    modalType: 'default',
    showBackdrop: true,
  });

  const handleOnSubmit = async (ev: any) => {
    const { promise, resolve } = Promise.withResolvers<void | {
      error: string;
    }>();
    const comments = getRejectionComments();
    const action = ev?.data?.action.value;
    if (!action /*action !== 'Reject'*/ || comments !== '') {
      resolve();
      return promise;
    }
    modal.setDetails({
      buttons: [
        {
          key: 'ok',
          label: 'Ok',
          style: LFFormButtonStyle.primary,
        },
      ],
      title: 'Submit',
    });
    modal.onClose('ok', async () => {
      const value = getRejectionComments();
      if (value === '') {
        resolve({ error: 'Please fill comments' });
        return;
      }
      resolve();
    });
    modal.onClose('close', () => {
      resolve({ error: 'Please fill comments' });
    });
    await modal.show();
    return promise;
  };

  // Register event handlers

  // This will be called when the form is submitted and will show a modal if the action is 'Reject' and comments are empty
  LFForm.onFormSubmission(handleOnSubmit);
};
