import { generateFullFieldHtml, makeLoadingBar, throttle } from '@lfz/lf-form-builder';
import type { FormFieldsType } from '.';


/* Register function just provided to initialize the code in this file
 * You can basically ignore this function and just read/use its contents
 */
export const registerFirstTimeLoad = (formFields: FormFieldsType) => {
  // Store fields you use at the top of your script to easily update them if anything changes
  // In this case fields are already stored in the formFields variable

  // Declare helper functions
  const handleFirstTimeLoad = async (disable = false) => {
    disable &&
      LFForm.unsubscribe('fieldChange', {
        ...formFields.productCurrency,
        handlerName: 'handleFirstTimeLoad',
      });
    const loader = disable
      ? '' // Hide loading bar
      : generateFullFieldHtml(
          makeLoadingBar(100, {
            text: 'Loading your form',
            styles: 'align-self: self-start; padding: 200px 100px',
          }),
          {
            classes: 'use-background-color',
          },
        );
    await LFForm.changeFormSettings({
      description: loader,
    });
  };

  // Register event handlers
  // This will be called when the form is loaded and then unsubscribed to prevent multiple calls
  LFForm.onFieldChange(
    throttle(() => handleFirstTimeLoad(true)),
    { ...formFields.productCurrency, handlerName: 'handleFirstTimeLoad' },
  );

  // Wrap business logic in an async function to properly handle promises
  const main = async () => {
    console.log('LFForm main function');
    // Ensure proper order of execution by using async and await
    await handleFirstTimeLoad();
  };
  // Call the main function to start the process
  main().catch(console.warn);
};
