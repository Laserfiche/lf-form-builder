/**
 * Sample Form starter.
 * Demonstrates how to set up a form with the LFForm API. This is a basic template to get you started, and you can expand upon it with your specific form fields and business logic.
 */

import { LFFormId, TextField } from '@lfz/lf-form-types';

// Define the fields your form uses
const formFields = {
  exampleField: { fieldId: 1 },
} as const;

// Business Logic for your form goes here
const exampleBusinessLogic = (exampleField: LFFormId) => {
  const fieldValue = LFForm.getFieldValues<TextField>(exampleField);
  console.log('Example field value:', fieldValue);
}

// Set up event listeners for your form fields
LFForm.onFieldBlur((ev) => exampleBusinessLogic(ev.options[0]), formFields.exampleField);

// Example main function that wires up the form logic. You can have as many functions as you need, this is just a starting point.
const main = async () => {
  try {
    // Also run business logic on form load if needed
    exampleBusinessLogic(formFields.exampleField);
  } catch (error) {
    console.error('Error in form logic:', error);
  }
};

main().catch(console.warn);
