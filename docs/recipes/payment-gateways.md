---
title: Payment Gateways (Stripe, Braintree, Authorize.net)
description: Wire up embedded checkout for Stripe, Braintree, or Authorize.net using the Empower2026 example pages.
category: payments
---

# Payment Gateways

> [!WARNING]
> These are unsupported reference samples, not a certified payment application. Accepting cards puts
> you in scope for PCI DSS, and the three samples do **not** carry the same PCI scope as each other.
> Read [PCI DSS scope and your SAQ](#pci-dss-scope-and-your-saq) before adapting any of them. Your
> acquirer and QSA — not this document — determine which SAQ applies to you.

The Empower2026 example includes three ready-to-adapt payment pages, one per gateway. Each page follows the same architecture and exposes the same shape of integration points, so you can pick one gateway, delete (or disable) the other two, and wire up the fields for your form.

| Page | Source | Gateway | Card capture | Card data in your page? |
| --- | --- | --- | --- | --- |
| Page 3 | [`page3Payment.ts`](../../packages/examples/src/Forms/Empower2026/page3Payment.ts) | Stripe | Stripe embedded Checkout (gateway iframe) | No |
| Page 4 | [`page4BraintreePayment.ts`](../../packages/examples/src/Forms/Empower2026/page4BraintreePayment.ts) | Braintree | Braintree Drop-in UI (gateway iframes) | No |
| Page 5 | [`page5AuthorizeNetPayment.ts`](../../packages/examples/src/Forms/Empower2026/page5AuthorizeNetPayment.ts) | Authorize.net | Card fields rendered by this sample, tokenized by `fetch()` | **Yes** |

> [!CAUTION]
> **Page 5 is materially different from pages 3 and 4.** It renders its own card number, expiry, and
> CVV inputs and POSTs them to Authorize.net from the browser — the card data passes through markup
> this repository controls, not through a gateway-hosted iframe. That is not eligible for SAQ A under
> any reading. Use pages 3 or 4 unless you have confirmed with your QSA that you can meet the much
> larger obligation page 5 creates. See [PCI DSS scope and your SAQ](#pci-dss-scope-and-your-saq).

Each page's file header documents its exact message flow (`INITIALIZE` → `COMPLETE_CHECKOUT`/`ERROR`) and field map — read the JSDoc at the top of the corresponding file for the authoritative, up-to-date sequence. This page covers what's common across all three and how to point one at your own form.

## Shared architecture

- The Checkout button and result/status messages render into `CustomHtml` fields — no native LFForm payment field type is required.
- Clicking Checkout injects an `<iframe>` whose `src` is the current page URL — which is the Forms renderer's [`sandbox.html`](#the-sandbox-bootstrap) — with the gateway config passed as a URL hash fragment (not a query string, which the LF form sanitizer strips from iframe `src` attributes).
- That second sandbox instance re-requests this script's own source via `postMessage` and evaluates it inline, so copying the built `Empower2026.js` to your Forms environment is sufficient — there is no separate asset to host alongside it.
- Parent and iframe communicate through `PostMessageHelper` on a per-page-load random channel ID, with peer discovery capped at a 15 second timeout.
- Gateway SDK URLs are fixed constants inside the plugins, validated against an origin allowlist. Nothing from the hash fragment ever reaches a `<script src>` — see [PCI-01 below](#never-load-a-script-from-a-hash-supplied-url).
- If a `checkoutModal` field is configured, the iframe opens inside an `LFFormModal`; otherwise it renders directly into the `checkoutFrame` field.
- Every page can be disabled independently via a `VITE_DISABLE_PAGE*` env flag (`VITE_DISABLE_PAGE3`, `VITE_DISABLE_PAGE4`, `VITE_DISABLE_PAGE5`) without touching the page's calling code.

## Environment variables

Set these in `.env.local` (see [`.env.example`](../../.env.example) for the full annotated list). Values are embedded at build time, so rebuild after changing them:

| Gateway | Variables |
| --- | --- |
| Stripe | `VITE_STRIPE_PUBLIC_KEY` — publishable key, must start with `pk_` |
| Braintree | `VITE_BRAINTREE_TOKENIZATION_KEY` — `sandbox_...` or `production_...`; used only as a fallback when no lookup rule writes a `client_token` |
| Authorize.net | `VITE_AUTHORIZENET_API_LOGIN_ID`, `VITE_AUTHORIZENET_CLIENT_KEY`, and `VITE_AUTHORIZENET_SANDBOX` |

Every variable in this table holds a value that is **public by design** and is meant to be readable in
the built bundle. See [Which keys go where](#which-keys-go-where) before adding any others.

`VITE_AUTHORIZENET_SANDBOX` selects the tokenization endpoint: `false` uses `api.authorize.net`,
anything else (including unset) stays on `apitest.authorize.net`. Defaulting to sandbox means a typo
can never point test credentials at the live endpoint. Switching it to `false` is only half of going
to production — see [Going to production](#going-to-production).

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

> [!IMPORTANT]
> The bundled `.bri` files ship with `REPLACE_ME_*` placeholders where merchant credentials go. They
> will not work until you supply your own — that is deliberate. Fill them in **after import, in the
> Process designer**, and never commit the filled-in export. See
> [Which keys go where](#which-keys-go-where).

`RGWebRequestToStripeCreateSession` creates a Checkout Session and returns its `client_secret`; it
does not charge the card. Stripe collects and charges inside its own embedded Checkout.

## The sandbox bootstrap

The document the payment iframe loads is `sandbox.html` — the Laserfiche Forms renderer's own
sandbox template (`modernFormRenderer/template/sandbox.html`), shipped with the Forms container. It
is **not** an asset from this repository and not something you host.

This is why `${window.location.origin}${window.location.pathname}` is the correct iframe `src`: form
scripts already execute inside that sandbox, so the current page URL *is* `sandbox.html`. Clicking
Checkout opens a second instance of it as a sibling frame, configured through the hash fragment.

When it receives a hash containing `rootId`, that template:

1. Sets `window.__lfSandboxMode` and `window.__lfSandboxParams` from the hash.
2. Creates the mount point named by `rootId`.
3. Broadcasts `__lfEmbedScriptRequest` to its sibling frames.
4. Evaluates the `__lfEmbedScriptResponse` code it receives, which re-runs this bundle in sandbox mode.

### Rules for code on this path

Your script runs in the same document tree as the gateway's card-capture iframe. If you adapt these
samples, hold your code to these rules:

- Never load a script, stylesheet, image, or iframe from **any URL that came out of the hash
  fragment**. It is fully attacker-controllable in a crafted link.
- Never write a hash value into `innerHTML`, `insertAdjacentHTML`, a `javascript:` URL, or an inline
  handler.
- Never answer a `postMessage` request without checking `event.origin`, and never reply or broadcast
  to `targetOrigin: '*'`.
- Never read, collect, or log card data.

The `__lfEmbedScriptRequest` relay in
[`index.ts`](../../packages/examples/src/Forms/Empower2026/index.ts) shows the third rule applied: it
rejects cross-origin requesters and malformed channel identifiers before returning any code.

The evaluate-delivered-source step exists only because the LF form sanitizer prevents the more direct
arrangement of a fixed-`src` hosted checkout page with a server-generated config token. It is a known
weakness — see [SAQ A eligibility](#saq-a-eligibility-open-decision). Do not build anything new on it.

## PCI DSS scope and your SAQ

Accepting a card payment through a form puts the merchant — the agency or organization running the
form, not Laserfiche — in scope for PCI DSS. This section is guidance for choosing a starting point.
**Your acquirer and QSA make the actual determination.** Reference: PCI DSS v4.0.1, SAQ A (January
2025 revision, effective 31 March 2025), and PCI SSC FAQ 1588.

### Never add card fields to your form

Do not add card number, expiry, CVV, or full track data fields to an LFForm form design, and do not
write them into form submission data, process variables, or lookup rule parameters. Doing so pulls
Laserfiche Forms, Laserfiche Process, the repository, and your audit trail into your cardholder data
environment, replacing a ~31-requirement SAQ A with a full SAQ D assessment of the whole stack.

Card data belongs in the gateway's own iframe. Pages 3 and 4 follow this rule. **Page 5 does not** —
it renders card inputs in the sandbox page and POSTs them to Authorize.net from the browser. Those
inputs are outside the form design, so they never reach form data, but they are still markup this
repository controls handling a PAN. Treat page 5 as a demonstration of the Authorize.net API flow,
not as a compliant capture pattern.

### Which keys go where

| Value | Class | Where it belongs | In the bundle? |
| --- | --- | --- | --- |
| Stripe publishable key (`pk_...`) | Publishable | `VITE_STRIPE_PUBLIC_KEY` | Yes — public by design |
| Braintree tokenization key (`sandbox_...`/`production_...`) | Publishable | `VITE_BRAINTREE_TOKENIZATION_KEY` | Yes — public by design |
| Authorize.net Client Key | Publishable | `VITE_AUTHORIZENET_CLIENT_KEY` | Yes — public by design |
| Authorize.net API Login ID | Identifier | `VITE_AUTHORIZENET_API_LOGIN_ID` | Yes — not a secret on its own |
| Stripe secret key (`sk_...`) | **Secret** | Web service connection credential store | **Never** |
| Braintree private key | **Secret** | Web service connection credential store | **Never** |
| Authorize.net Transaction Key | **Secret** | See the note below | **Never** |

Build-time `VITE_*` embedding of the publishable values is correct and intentional. Do not "harden"
it by moving them to a server call — that adds a round trip and protects nothing.

Merchant secrets go in the Laserfiche web service connection's credential store, which is **not**
included in a `.bri` export. `RGWebRequestToStripe*.bri` does this correctly
(`CredentialProperties.Method: 3`, no secret in the file) and is the pattern to copy.

> [!NOTE]
> **Authorize.net is the exception, and it is a real constraint, not an oversight.** Its
> `/xml/v1/request.api` endpoint authenticates in the request body
> (`merchantAuthentication.name` / `.transactionKey`) and supports no HTTP authentication header, so
> the credential store cannot supply it the way it does for Stripe. The transaction key therefore has
> to be typed into the payload template in the Process designer, where it becomes part of any
> subsequent `.bri` export.
>
> Consequences you must plan for: treat every Authorize.net `.bri` export as a secret-bearing file,
> never commit one, and rotate the transaction key if an export leaves your control. If that is not
> acceptable, put a server-side endpoint you control in front of Authorize.net and have the lookup
> rule call that instead.

### SAQ A eligibility (open decision)

The January 2025 SAQ A revision removed requirements 6.4.3, 11.6.1, and 12.3.1 and added two
eligibility criteria:

1. All elements of the payment page delivered to the customer's browser originate only and directly
   from a PCI DSS compliant TPSP.
2. The merchant has confirmed its site is not susceptible to attacks from scripts that could affect
   the merchant's e-commerce systems.

FAQ 1588 clarifies that criterion 2 applies specifically to merchants embedding a third-party payment
form via iframe; a full redirect to the gateway's hosted page never reaches it.

Where these samples stand:

- **Card fields** live inside the gateway iframe for pages 3 and 4. That part satisfies criterion 1.
- **The hosting page** is a first-party bundle assembled by evaluating script delivered over
  `postMessage`. Criterion 2 is a site-wide attestation about script susceptibility, and a page whose
  own bootstrap is "evaluate code handed to me" is difficult to attest to truthfully, even with the
  origin, source, and channel checks `sandbox.html` now enforces.
- **Page 5** is out of scope for this discussion entirely — it handles the PAN directly.

Dropping from SAQ A to SAQ A-EP takes a merchant from roughly 31 requirements to roughly 151.

**This is an open product decision, not something a code change settles.** The options:

| Option | Approach | Trade-off |
| --- | --- | --- |
| (a) Redirect-first | Rework the primary sample to a full redirect to the gateway's hosted page | Unconditional SAQ A; criterion 2 never applies. Costs UX continuity within the form. |
| (b) Fix the substrate | Keep embedded; replace self-source-eval with a fixed-`src` hosted checkout page and a server-generated one-time config token | Keeps the UX; still requires a site-wide criterion 2 attestation. |
| (c) Publish both | Redirect as the default, embedded as a documented opt-in with the attestation burden spelled out | Most work; serves both audiences honestly. |

The LF sanitizer stripping query strings from iframe `src` — the original driver for the eval
mechanism — is solvable with a fixed-`src` page plus a fragment-free token handoff, and does not
require evaluating script in the payment page context.

Until that decision is recorded with security sign-off, treat these samples as **embedded-iframe
patterns whose SAQ A eligibility has not been established**, and raise it with your QSA explicitly.

### Never load a script from a hash-supplied URL

The sandbox page takes its whole configuration from the URL hash fragment, and a hash fragment is
fully attacker-controllable in a crafted link. If any hash value reaches a `<script src>`, an
attacker can run arbitrary JavaScript in the origin hosting the payment page, in the same document
tree as the card-capture iframe. That is the Magecart/e-skimming pattern PCI DSS 6.4.3 and 11.6.1
exist to mitigate.

Gateway SDK URLs are fixed module constants (`STRIPE_SDK_URL`, `BRAINTREE_DROPIN_SDK_URL`) loaded
through
[`loadGatewayScript`](../../packages/core/src/lib/utils/loadGatewayScript.ts), which rejects any URL
outside an origin allowlist. If you add a gateway, add its SDK origin to
`ALLOWED_GATEWAY_SDK_ORIGINS` and load from a constant — never from a parameter.

### Customer PII in submission and process data

The Stripe verification rule writes `customer_details.name`, `customer_details.email`, amount, and
currency into form fields (`VerifiedCustomerName`, `VerifiedCustomerEmail`, `VerifiedPaymentAmount`,
`VerifiedCurrencyType`, `VerifiedCustomer`).

None of this is cardholder data and it creates no PCI scope. It does persist personal information
into form submission data, process data, and the audit trail, which is a **privacy and retention**
question — apply your retention policy to it and do not let an assessor miscategorize it as
cardholder data. Drop the fields from the rule's output mapping if you do not need them.

### Reporting a problem

Report suspected vulnerabilities privately — see [SECURITY.md](../../SECURITY.md). Do not open a
public issue, and never include live credentials or cardholder data in a report.

## Going to production

1. **Switch the gateway endpoints.** Set `VITE_AUTHORIZENET_SANDBOX=false` for Authorize.net, and
   swap the publishable/tokenization keys for their live equivalents. Rebuild — these are embedded at
   build time.
2. **Repoint the lookup rules.** The imported `.bri` web services target sandbox hosts
   (`apitest.authorize.net`, `payments.sandbox.braintree-api.com`). Update `ConnectionInfo.ServiceUrl`
   on each to the production host in the Process designer.
3. **Load the merchant secrets into the credential store** — not into the payload template, except
   for the Authorize.net constraint described above. Replace every `REPLACE_ME_*` placeholder.
4. **Host the assets over HTTPS.** `Empower2026.js` and `sandbox.html` must both be reachable,
   same-origin with the form page. Do not leave the process pointed at `localhost`.
5. **Rotate keys on a schedule**, and immediately if a `.bri` export containing one has left your
   control.
6. **Confirm your SAQ with your acquirer or QSA** before taking live payments, using
   [PCI DSS scope and your SAQ](#pci-dss-scope-and-your-saq) as the starting point rather than the
   answer.

## Adding a gateway to a new form

1. Decide which single gateway you need and leave the other two pages disabled via their `VITE_DISABLE_PAGE*` flag (or delete their `page*Load(...)` call in [`index.ts`](../../packages/examples/src/Forms/Empower2026/index.ts)).
2. Update that page's `page*FormFields` constant with your form's field IDs.
3. Set the gateway's env variable(s) in `.env.local`.
4. Import the matching Laserfiche Process web request rule(s), point them at your form, and replace the `REPLACE_ME_*` credential placeholders.
5. Host `sandbox.html` alongside the built bundle, same-origin with the form page.
6. Rebuild (`npm run build:examples` or `npm run dev`) so the new env values are embedded in the output bundle.
