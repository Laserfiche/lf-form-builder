import type { LFFormId } from '@lfz/lf-form-types';
import { generateFullFieldHtml } from './fullFieldHtml';
import type { FullFieldHtmlOptions } from './fullFieldHtml';
import { makeLoadingBar } from './makeLoadingBar';
import type { LoadingBarOptions } from './makeLoadingBar';
import { throttle } from '../lib/utils/throttle';

export type LookupLoadTimeout = number | (() => boolean) | (() => Promise<boolean>);

export type LookupLoadingOptions = {
  fullFieldHtmlOptions?: FullFieldHtmlOptions;
  loadingBarOptions?: LoadingBarOptions;
  /** Optional loading-bar options used after initial load for subsequent lookup runs */
  subsequentLookupLoadingBarOptions?: LoadingBarOptions;
  /** When true, show the loading mask whenever the lookup rule runs (not only on first load) */
  maskOnLookup?: boolean;
};

export type RegisterFirstTimeLoadParams = {
  lookupRegisterField: LFFormId;
  lookupRuleId: number;
  timeout?: LookupLoadTimeout;
  options?: LookupLoadingOptions;
};

const raceLookupTriggerAndLoadTimeout = async (
  lookupRuleId: number,
  timeout: LookupLoadTimeout,
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

const registerLookupComplete = (lookupRegisterField: LFFormId, options?: LookupLoadingOptions) => {
  const loadingBarHandlerName = `loadingBar_handler_${lookupRegisterField?.fieldId ?? lookupRegisterField?.variableId ?? lookupRegisterField?.variableName ?? 'unknown'}`;

  const handleLoadingMask = async (
    disable = false,
    loadingBarOptionsOverride?: LoadingBarOptions,
  ) => {
    if (disable) {
      LFForm.unsubscribe('fieldChange', {
        ...lookupRegisterField,
        handlerName: loadingBarHandlerName,
      });
    }

    const loader = disable
      ? ''
      : generateFullFieldHtml(
          makeLoadingBar(100, {
            text: 'Loading your form',
            styles: 'background: white; padding: 2rem;',
            ...options?.loadingBarOptions,
            ...loadingBarOptionsOverride,
          }),
          options?.fullFieldHtmlOptions,
        );

    await LFForm.changeFormSettings({
      description: loader,
    });
  };

  const onLoadLookupPromise = new Promise<void>((resolve) => {
    LFForm.onFieldChange(
      throttle(async () => {
        await handleLoadingMask(true);
        resolve();
      }),
      { ...lookupRegisterField, handlerName: loadingBarHandlerName },
    );
  });

  return {
    showLoader: (loadingBarOptionsOverride?: LoadingBarOptions) =>
      handleLoadingMask(false, loadingBarOptionsOverride),
    hideLoader: () => handleLoadingMask(true),
    onLoadLookupPromise,
  };
};

/**
 * Shows a loading mask until the first lookup-driven field update completes, with optional recurring mask support.
 *
 * Parameters:
 * - `lookupRegisterField` (LFFormId): the field (or variable) that the lookup writes to. Used to
 *   subscribe `LFForm.onFieldChange` so we can detect when lookup-applied data has landed and
 *   hide the loading mask. Also used for `LFForm.unsubscribe` when removing the handler.
 * - `lookupRuleId` (number): the lookup rule identifier. Used to listen for `LFForm.onLookupTrigger`
 *   (the lookup start signal) as one arm of the race with the timeout. When `options.maskOnLookup`
 *   is true, it's also used to register recurring `onLookupTrigger` / `onLookupDone` listeners to
 *   show/hide the mask for subsequent lookups after the initial load completes.
 * - `timeout` (number | () => boolean | () => Promise<boolean>): a fallback/readiness check used
 *   when a numeric timeout isn't suitable. If a function is provided we poll it (~100ms) until it
 *   returns true (or resolves to true). If it returns true before a lookup triggers the race
 *   resolves as a timeout and the loader is hidden.
 */
export const registerFirstTimeLoad = async ({
  lookupRegisterField,
  lookupRuleId,
  timeout = 500,
  options,
}: RegisterFirstTimeLoadParams) => {
  let isInitialLoadComplete = false;
  const cancelToken = { isCancelled: false };
  const triggerPromise = raceLookupTriggerAndLoadTimeout(lookupRuleId, timeout, cancelToken);
  const lookupCompleteHandler = registerLookupComplete(lookupRegisterField, options);

  if (options?.maskOnLookup) {
    try {
      const maskLookupHandlerName = `maskOnLookup_${lookupRuleId}`;
      const maskHideByDoneHandlerName = `maskOnLookup_hide_done_${lookupRuleId}`;

      LFForm.onLookupTrigger(
        () => {
          if (!isInitialLoadComplete) return;
          void lookupCompleteHandler.showLoader(options?.subsequentLookupLoadingBarOptions);
        },
        { lookupRuleId, handlerName: maskLookupHandlerName },
      );

      LFForm.onLookupDone(
        async () => {
          if (!isInitialLoadComplete) return;
          await lookupCompleteHandler.hideLoader();
        },
        { lookupRuleId, handlerName: maskHideByDoneHandlerName },
      );
    } catch {
      // optional recurring mask registration is best-effort
    }
  }

  void lookupCompleteHandler.showLoader();
  const trigger = await triggerPromise;
  if (trigger === 'timeout') {
    await lookupCompleteHandler.hideLoader();
    isInitialLoadComplete = true;
    return;
  }

  await lookupCompleteHandler.onLoadLookupPromise;
  isInitialLoadComplete = true;
};
