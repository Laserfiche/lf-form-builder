import './empower2026.lfless';

import { initStripeIframe, initBraintreeIframe, initAuthorizeNetIframe } from '@lf/lf-form-builder';
import { page1Load } from './page1LoadLookup';
import { page2Load, page2FormFields } from './page2MapsAutoComplete';
import { page3Load, page3FormFields } from './page3Payment';
import { page4BraintreeLoad, page4BraintreeFormFields } from './page4BraintreePayment';
import { page5AuthorizeNetLoad, page5AuthorizeNetFormFields } from './page5AuthorizeNetPayment';

// sandbox.html sets window.__lfSandboxMode and window.__lfSandboxParams on the
// window before loading this script so the IIFE can detect the sandbox context
// at runtime. IIFE bundlers replace import.meta.url at build time, making it
// unreliable for runtime URL detection when the script is loaded dynamically.
declare const window: Window & { __lfSandboxMode?: string; __lfSandboxParams?: URLSearchParams };
const scriptMode = window.__lfSandboxMode ?? '';

if (scriptMode === 'stripe-sandbox') {
  initStripeIframe(window.__lfSandboxParams ?? new URLSearchParams());
} else if (scriptMode === 'braintree-sandbox') {
  initBraintreeIframe(window.__lfSandboxParams ?? new URLSearchParams());
} else if (scriptMode === 'authorizenet-sandbox') {
  initAuthorizeNetIframe(window.__lfSandboxParams ?? new URLSearchParams());
} else {
  // Relay this script's source to nested payment iframes that request it via
  // __lfEmbedScriptRequest. Works in both delivery modes:
  //   • Inline: sandbox.html evaluates the code directly and sets __lfInlineScript.
  //   • Hosted (URL): the script is loaded via <script src="...">, so
  //     __lfInlineScript is not set. We fetch our own source on demand instead.
  //     import.meta.url is transformed by Vite to document.currentScript.src
  //     (IIFE build) or the module URL (ES build), giving the correct URL in both.
  const selfCode = (window as Window & { __lfInlineScript?: string }).__lfInlineScript;
  // Capture URL before the synchronous IIFE finishes — document.currentScript
  // is only set while the <script> element is executing (IIFE / classic scripts).
  // Falls back to import.meta.url for ES module builds.
  // Capture the script URL while the IIFE is still executing — document.currentScript
  // is only set during synchronous script evaluation (classic / IIFE format).
  const selfScriptSrc = (document.currentScript as HTMLScriptElement | null)?.src ?? '';

  if (selfCode || selfScriptSrc) {
    // Cache the hosted-mode fetch so we only hit the network once per page load.
    let hostedCodePromise: Promise<string> | null = null;
    const getCode = (): Promise<string> => {
      if (selfCode) return Promise.resolve(selfCode);
      hostedCodePromise ??= fetch(selfScriptSrc).then((r) => r.text()).catch(() => '');
      return hostedCodePromise;
    };

    /** Guards against echoing back an unbounded value; not a format check. */
    const isUsableId = (value: unknown): value is string =>
      typeof value === 'string' && value.length <= 64;

    window.addEventListener('message', (e: MessageEvent) => {
      // Shape first, then origin. Any frame on the page can post here, so
      // checking the origin first would mean warning about every unrelated
      // cross-origin message rather than only about script requests.
      if (typeof e.data !== 'object' || e.data === null) return;
      const data = e.data as Record<string, unknown>;
      if (data.type !== '__lfEmbedScriptRequest') return;

      // Past this point the message is asking for this bundle's source, so a
      // rejection is worth reporting: unlogged, a misconfigured integration
      // surfaces only as a 15 second peer-discovery timeout at checkout.
      //
      // Same-origin is the control. A frame that clears it can already run code
      // in this document, so the ids below get a length bound only — sandbox.html
      // compares them by equality and never puts them in markup or a URL.
      if (e.origin !== window.location.origin) {
        console.warn(
          '[Empower2026] Ignored a payment script request from a foreign origin:',
          e.origin, '— expected', window.location.origin,
        );
        return;
      }
      const { channelId, rootId } = data;
      if (!isUsableId(channelId) || !isUsableId(rootId)) {
        console.warn(
          '[Empower2026] Ignored a payment script request whose channelId/rootId was not a string of 64 characters or fewer:',
          channelId, rootId,
        );
        return;
      }

      const src = e.source;
      if (!src || typeof (src as Window).postMessage !== 'function') return;
      getCode().then((code) => {
        if (!code) {
          console.warn('[Empower2026] Payment script requested, but this bundle\'s own source could not be read.');
          return;
        }
        try {
          // Restrict delivery to the requesting frame's origin. Paired with
          // sandbox.html's own origin and channel checks on the response, this
          // closes the cross-origin injection window in both directions.
          (src as Window).postMessage(
            { type: '__lfEmbedScriptResponse', rootId, channelId, code },
            e.origin,
          );
        } catch { /* cross-origin or closed — ignore */ }
      }).catch(() => {});
    });
  }

  const main = async () => {
    page1Load().catch(console.warn);
    page2Load({
      formFields: page2FormFields,
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    }).catch(console.warn);
    page3Load({
      formFields: page3FormFields,
    }).catch(console.warn);
    page4BraintreeLoad({
      formFields: page4BraintreeFormFields,
    }).catch(console.warn);
    page5AuthorizeNetLoad({
      formFields: page5AuthorizeNetFormFields,
    }).catch(console.warn);
  };

  main().catch(console.warn);
}
