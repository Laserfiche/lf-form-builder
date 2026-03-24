/* Code in this file is purposely split into section and registered separately
 * to allow for readability and provide a better understanding of the flow of each individual functionality.
 * You do not need to write your code this way, especially if you are not using a JS bundler like I do.
 */
import { registerFirstTimeLoad } from './firstTimeLoad';
import { registerHtmlPerRow } from './htmlPerRow';
import { registerSelectAll } from './selectAll';
import { registerSubmitModal } from './submitModal';

// Store fields you use at the top of your script to easily update them if anything changes
const formFields = {
  // Use variable name over field id when finding fields
  productName: { fieldId: 10 },
  productBrand: { fieldId: 9 },
  productCurrency: { fieldId: 11 },
  comments: { fieldId: 12 },
  openModalHtml: { fieldId: 14 },
  productModal: { fieldId: 17 },

  selectRowCol: { fieldId: 13 },

  modalContainer: { fieldId: 7 },
} as const;

export type FormFieldsType = typeof formFields;

registerSubmitModal(formFields);
registerHtmlPerRow(formFields);
registerSelectAll(formFields);
registerFirstTimeLoad(formFields);