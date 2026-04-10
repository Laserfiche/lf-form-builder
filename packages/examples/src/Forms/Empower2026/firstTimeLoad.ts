import { FullFieldHtmlOptions, generateFullFieldHtml, LoadingBarOptions } from '@lfz/lf-form-builder';
import { makeLoadingBar } from '@lfz/lf-form-builder';
import { throttle } from '@lfz/lf-form-builder';
import { LFFormId } from '@lfz/lf-form-types';

type TimeoutType = number | (() => boolean) | (() => Promise<boolean>);

/**
 * Either resolves when the specified lookup rule is triggered or when the specified timeout is reached, whichever happens first
 * @preserve
 * @param {number} lookupRuleId - The ID of the lookup rule to listen for
 * @param {TimeoutType} timeout - The maximum time to wait for the lookup trigger before timing out (in milliseconds) or a function that returns a boolean or a promise that resolves to a boolean
 * @returns {Promise<'lookup' | 'timeout'>} - A promise that resolves to 'lookup' if the lookup trigger occurs first, or 'timeout' if the timeout occurs first
 */
const raceLookupTriggerAndLoadTimeout = async (
  lookupRuleId: number,
  timeout: TimeoutType,
  cancelToken: { isCancelled: boolean },
) => {
  const lookupTriggerPromise = new Promise<'lookup'>((resolve, reject) => {
    LFForm.onLookupTrigger(
      () => {
        if (cancelToken.isCancelled) return reject('canceled');
        resolve('lookup');
        cancelToken.isCancelled = true;
      },
      { lookupRuleId, handlerName: 'raceLookupTriggerAndLoadTimeout' },
    );
  });

  const loadTimeout = new Promise<'timeout'>((resolve, reject) => {
    if (typeof timeout === 'function') {
      const checkCondition = async () => {
        try {
          const result = await timeout();
          if (cancelToken.isCancelled) return reject('canceled');
          if (result) {
            resolve('timeout');
            cancelToken.isCancelled = true;
          } else {
            setTimeout(checkCondition, 100);
          }
        } catch (error) {
          console.warn('Error in timeout function:', error);
          setTimeout(checkCondition, 100);
        }
      };
      void checkCondition();
      return;
    }
    setTimeout(() => {
      resolve('timeout');
      cancelToken.isCancelled = true;
    }, timeout);
  });

  return Promise.race([lookupTriggerPromise, loadTimeout]);
};

/**
 * Register function just provided to initialize the code in this file
 * You can basically ignore this function and just read/use its contents
 * @preserve
 * @param {LFFormId} lookupRegisterField - The ID of the lookup field to listen for lookup rule changes on
 * @returns {{ showLoader: () => Promise<void>, hideLoader: () => Promise<void> }} - An object with functions to show and hide the loading bar
 */
const registerLookupComplete = (lookupRegisterField: LFFormId) => {
  // Store fields you use at the top of your script to easily update them if anything changes
  // In this case fields are already stored in the formFields variable

  // Declare helper functions
  const handleFirstTimeLoad = async (disable = false) => {
    if (disable) {
      LFForm.unsubscribe('fieldChange', {
        ...lookupRegisterField,
        handlerName: 'handleFirstTimeLoad',
      });
    }
    const loader = disable
      ? '' // Hide loading bar
      : generateFullFieldHtml(
          makeLoadingBar(100, {
            text: 'Loading your form',
            styles: 'background: white; padding: 2rem;',
          }),
        );
    await LFForm.changeFormSettings({
      description: loader,
    });
  };

  // Register event handlers
  // This will be called when the form is loaded and then unsubscribed to prevent multiple calls
  const onLoadLookupPromise = new Promise<void>((resolve) => {
    LFForm.onFieldChange(
      throttle(async () => {
        await handleFirstTimeLoad(true);
        resolve();
      }),
      { ...lookupRegisterField, handlerName: 'handleFirstTimeLoad' },
    );
  });

  return {
    showLoader: () => handleFirstTimeLoad(false),
    hideLoader: () => handleFirstTimeLoad(true),
    onLoadLookupPromise,
  };
};

/**
 * @preserve
 * @param {LFFormId} lookupRegisterField - The ID of the lookup field to listen for lookup rule changes on
 * @param {number} lookupRuleId - The ID of the lookup rule to listen for
 * @param {number | (() => boolean) | (() => Promise<boolean>)} timeout - The maximum time to wait for the lookup trigger before timing out (in milliseconds) or a function that returns a boolean or a promise that resolves to a boolean indicating whether the timeout condition has been met
 * @param {{ fullFieldHtmlOptions: FullFieldHtmlOptions, loadingBarOptions: LoadingBarOptions }} options - Additional options for the full field HTML
 * @return {Promise<void>} - A promise that resolves when the first time load process is complete
 */
export const registerFirstTimeLoad = async ({
  lookupRegisterField,
  lookupRuleId,
  timeout = 500,
  options,
}: {
  lookupRegisterField: LFFormId;
  lookupRuleId: number;
  timeout?: number | (() => boolean) | (() => Promise<boolean>);
  options?: { fullFieldHtmlOptions: FullFieldHtmlOptions; loadingBarOptions: LoadingBarOptions };
}) => {
  // Wrap business logic in an async function to properly handle promises
  const cancelToken = { isCancelled: false };
  const triggerPromise = raceLookupTriggerAndLoadTimeout(
    lookupRuleId,
    timeout,
    cancelToken,
  );
  const lookupCompleteHandler = registerLookupComplete(lookupRegisterField);
  void lookupCompleteHandler.showLoader();
  const trigger = await triggerPromise;
  if (trigger === 'timeout') {
    return lookupCompleteHandler.hideLoader();
  }
  return lookupCompleteHandler.onLoadLookupPromise;
};
