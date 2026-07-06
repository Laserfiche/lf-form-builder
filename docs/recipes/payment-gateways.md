---
title: Payment Gateways (Stripe, Braintree, Authorize.net)
description: Wire up embedded checkout for Stripe, Braintree, or Authorize.net using the Empower2026 example pages.
category: payments
---

# Payment Gateways

The Empower2026 example includes three ready-to-adapt payment pages, one per gateway. Each page follows the same architecture and exposes the same shape of integration points, so you can pick one gateway, delete (or disable) the other two, and wire up the fields for your form.

| Page | Source | Gateway | Card capture |
| --- | --- | --- | --- |
| Page 3 | [`page3Payment.ts`](../../packages/examples/src/Forms/Empower2026/page3Payment.ts) | Stripe | Stripe embedded Checkout |
| Page 4 | [`page4BraintreePayment.ts`](../../packages/examples/src/Forms/Empower2026/page4BraintreePayment.ts) | Braintree | Braintree Drop-in UI |
| Page 5 | [`page5AuthorizeNetPayment.ts`](../../packages/examples/src/Forms/Empower2026/page5AuthorizeNetPayment.ts) | Authorize.net | Accept.js (hosted tokenization) |

Each page's file header documents its exact message flow (`INITIALIZE` → `COMPLETE_CHECKOUT`/`ERROR`) and field map — read the JSDoc at the top of the corresponding file for the authoritative, up-to-date sequence. This page covers what's common across all three and how to point one at your own form.

## Shared architecture

- The Checkout button and result/status messages render into `CustomHtml` fields — no native LFForm payment field type is required.
- Clicking Checkout injects an `<iframe>` whose `src` is the current page URL with the gateway config passed as a URL hash fragment (not a query string, which the LF form sanitizer strips from iframe `src` attributes).
- The iframe re-requests this script's own source via `postMessage` and evaluates it inline, so copying only the built `Empower2026.js` to your Forms environment is sufficient — there is no separate `stripe.html`/`sandbox.html` asset to host alongside it.
- Parent and iframe communicate through `PostMessageHelper` on a per-page-load random channel ID, with peer discovery capped at a 15 second timeout.
- If a `checkoutModal` field is configured, the iframe opens inside an `LFFormModal`; otherwise it renders directly into the `checkoutFrame` field.
- Every page can be disabled independently via a `VITE_DISABLE_PAGE*` env flag (`VITE_DISABLE_PAGE3`, `VITE_DISABLE_PAGE4`, `VITE_DISABLE_PAGE5`) without touching the page's calling code.

## Environment variables

Set these in `.env.local` (see [`.env.example`](../../.env.example) for the full annotated list). Values are embedded at build time, so rebuild after changing them:

| Gateway | Variables |
| --- | --- |
| Stripe | `VITE_STRIPE_PUBLIC_KEY` — publishable key, must start with `pk_` |
| Braintree | `VITE_BRAINTREE_TOKENIZATION_KEY` — `sandbox_...` or `production_...`; used only as a fallback when no lookup rule writes a `client_token` |
| Authorize.net | `VITE_AUTHORIZENET_API_LOGIN_ID` and `VITE_AUTHORIZENET_CLIENT_KEY` |

> [!NOTE]
> `.env.example` also documents a `VITE_AUTHORIZENET_SANDBOX` flag intended to switch Accept.js between the sandbox and production endpoints. `page5AuthorizeNetPayment.ts` does not currently read this variable — the iframe always requests the sandbox endpoint (`sandbox: 'true'` is hardcoded). If you need a production Authorize.net flow, wire that variable through before going live.

## Field mapping

Each page's `*FormFields` type documents its required and optional `LFFormId` fields. At minimum, every gateway needs:

- `checkoutFrame` — `CustomHtml` field that hosts the iframe (used as a fallback even when a modal is configured)
- `checkoutSessionResult` — `CustomHtml` field for success/error messages
- `triggerCheckoutButton` — `CustomHtml` field that renders the Checkout button
- `isFinished` — text field used as a status flag (`'success'`/`'fail'` for Stripe; `'charge'`/`'fail'` for Braintree/Authorize.net, since those two require a server-side charge step after tokenization)

Gateway-specific fields (session/nonce plumbing, verification results) are listed in full in each file's JSDoc:

- Stripe: see the `PaymentFormFields` doc comment in [`page3Payment.ts`](../../packages/examples/src/Forms/Empower2026/page3Payment.ts)
- Braintree: see the `BraintreePaymentFormFields` doc comment in [`page4BraintreePayment.ts`](../../packages/examples/src/Forms/Empower2026/page4BraintreePayment.ts)
- Authorize.net: see the `AuthorizeNetPaymentFormFields` doc comment in [`page5AuthorizeNetPayment.ts`](../../packages/examples/src/Forms/Empower2026/page5AuthorizeNetPayment.ts)

Update the corresponding `page*FormFields` constant in the source file with the field IDs from your form design — the shipped IDs match the example form only.

## Server-side pieces (lookup rules / Laserfiche Process)

- **Stripe** creates its checkout session server-side: a lookup rule must call the Stripe API and write the returned `client_secret` to the `sessionId` field before Checkout is clickable.
- **Braintree** and **Authorize.net** tokenize the card client-side first, then require a lookup rule to charge the resulting nonce/opaque data server-side (triggered when `isFinished` is set to `'charge'`) and write the result back to `transactionId`/`finalstatus`.

The bundled Laserfiche Process assets under [`Laserfiche Process/`](../../packages/examples/src/Forms/Empower2026/Laserfiche%20Process) implement these lookup rules per gateway (`RGWebRequestToStripe*.bri`, `RGWebRequestToBraintree*.bri`, `RGWebRequestToAuthNet*.bri`). See the root [README's Empower2026 Setup section](../../README.MD#empower2026-setup) for which files to import for the gateway you're using.

## Adding a gateway to a new form

1. Decide which single gateway you need and leave the other two pages disabled via their `VITE_DISABLE_PAGE*` flag (or delete their `page*Load(...)` call in [`index.ts`](../../packages/examples/src/Forms/Empower2026/index.ts)).
2. Update that page's `page*FormFields` constant with your form's field IDs.
3. Set the gateway's env variable(s) in `.env.local`.
4. Import the matching Laserfiche Process web request rule(s) and point them at your form.
5. Rebuild (`npm run build:examples` or `npm run dev`) so the new env values are embedded in the output bundle.
