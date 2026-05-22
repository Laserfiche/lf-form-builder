import './empower2026.lfless';

import { page1Load } from './page1LoadLookup';
import { page2Load, page2FormFields } from './page2MapsAutoComplete';
import { page3Load, page3FormFields } from './page3Payment';

const resolveStripeFrame = (): { stripeFrameUrl: string; stripeFrameOrigin: string } => {
  const urlOverride = import.meta.env.VITE_STRIPE_FRAME_URL?.trim();
  const originOverride = import.meta.env.VITE_STRIPE_FRAME_ORIGIN?.trim();
  if (urlOverride) {
    const origin = originOverride ?? new URL(urlOverride).origin;
    return { stripeFrameUrl: urlOverride, stripeFrameOrigin: origin };
  }

  const currentScript = document.currentScript as HTMLScriptElement | null;
  const allScripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
  const entryScript =
    (currentScript?.src ? currentScript : null) ??
    allScripts.find((s) => /Empower2026\.js(\?|$)/i.test(s.src));

  if (entryScript?.src) {
    const scriptUrl = new URL(entryScript.src);
    const scriptDir = scriptUrl.pathname.replace(/[^/]*$/, '');
    const stripeFrameOrigin = originOverride ?? scriptUrl.origin;

    const stripeFrameUrl = `${stripeFrameOrigin}${scriptDir}stripe.html`;
    return { stripeFrameUrl, stripeFrameOrigin };
  }

  const stripeFrameOrigin = originOverride ?? window.location.origin;
  return { stripeFrameUrl: `${stripeFrameOrigin}/stripe.html`, stripeFrameOrigin };
};

const { stripeFrameUrl, stripeFrameOrigin } = resolveStripeFrame();
console.log('[Empower2026] stripeFrameUrl:', stripeFrameUrl, 'origin:', stripeFrameOrigin);

const main = async () => {
  page1Load().catch(console.warn);
  page2Load({
    formFields: page2FormFields,
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  }).catch(console.warn);
  page3Load({
    formFields: page3FormFields,
    stripeFrameOrigin,
    stripeFrameUrl,
  }).catch(console.warn);
 
};

main().catch(console.warn);
