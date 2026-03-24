/**
 * Sample Form — minimal example using lf-form-builder utilities
 *
 * This demonstrates how to import and use helper functions
 * from the lf-form-builder package within a Laserfiche Forms customization.
 */
import { findField } from '@lfz/lf-form-builder';

// Define the fields your form uses
const formFields = {
  exampleField: { fieldId: 1 },
} as const;

const main = async () => {
  const fields = findField(formFields.exampleField);
  console.log('Found fields:', fields);
};

main().catch(console.warn);
