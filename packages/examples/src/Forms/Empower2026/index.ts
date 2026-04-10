import './empower2026.lfless';

import { page1Load } from './page1LoadLookup';
import { page2Load } from './page2MapsAutoComplete';
import { page3Load } from './page3Payment';

const formFields = {
  page1: {},
  page2: {
    addressSearch: { fieldId: 13, componentType: 'SingleLine' },
    addressPopulate: { fieldId: 6 },
    addressConfirmationModal: { fieldId: 25 },
  },
  page3: {
    sessionId: { fieldId: 19 },
    checkoutFrame: { fieldId: 20 },
    checkoutSection: { fieldId: 21 },
    checkoutSessionResult: { fieldId: 22 },
    triggerCheckoutButton: { fieldId: 24 },
  },
} as const;

const lookupRules = {
  createCheckoutSession: 2,
};

const main = async () => {
  page1Load().catch(console.warn);
  page2Load({
    formFields: formFields.page2,
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  }).catch(console.warn);
  page3Load({
    formFields: formFields.page3,
    createCheckoutSessionRuleId: lookupRules.createCheckoutSession,
    stripeFrameOrigin: 'https://localhost:3000',
  }).catch(console.warn);
};

main().catch(console.warn);
