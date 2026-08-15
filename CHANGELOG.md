# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- **Payment plugins no longer load scripts from a caller-supplied URL.** `initStripeIframe` and
  `initBraintreeIframe` read `scriptSrc` from `params` — the iframe's URL hash fragment, which is
  fully attacker-controllable in a crafted link — and passed it to a `<script src>`. A crafted link
  could run arbitrary JavaScript in the origin hosting the payment page, in the same document tree as
  the gateway's card-capture iframe. Gateway SDK URLs are now fixed module constants
  (`STRIPE_SDK_URL`, `BRAINTREE_DROPIN_SDK_URL`) loaded through the new `loadGatewayScript`, which
  rejects any URL outside `ALLOWED_GATEWAY_SDK_ORIGINS`. The `scriptSrc` parameter is ignored.
  **Anyone consuming these plugins should update.**
- **Removed committed Authorize.net and Braintree sandbox credentials** from the bundled `.bri`
  process assets, replaced with `REPLACE_ME_*` placeholders. The exposed sandbox credentials must be
  treated as compromised and rotated — they remain in the published git history.
- Added `npm run check:secrets` (`scripts/check-committed-secrets.mjs`), wired into CI and available
  as a pre-commit hook, which fails on credentials in `.bri` payload templates and connection
  usernames plus well-known secret-key shapes anywhere in the tree.
- Hardened the `__lfEmbedScriptRequest` relay in the Empower2026 example to reject cross-origin
  requesters and malformed channel/root identifiers.
- Added `SECURITY.md` with a private disclosure address.

### Added

- A PCI DSS section in `docs/recipes/payment-gateways.md`: SAQ selection, the "never add card fields
  to your form" rule, a publishable-vs-secret key table, the open SAQ A eligibility decision, and a
  "Going to production" checklist.
- Documented the sandbox bootstrap: that `sandbox.html` is the Forms renderer's own template rather
  than a repository asset, and the rules any code on that path must hold to.

### Changed

- `page5AuthorizeNetPayment.ts` now reads `VITE_AUTHORIZENET_SANDBOX` instead of hardcoding
  `sandbox: 'true'`. It defaults to the sandbox endpoint when unset, so a typo cannot point test
  credentials at the live endpoint.
- Renamed `RGWebRequestToStripeCharge.bri` to `RGWebRequestToStripeCreateSession.bri`. The rule
  creates a Checkout Session and returns a `client_secret`; it does not charge a card.
- Documented that page 5 (Authorize.net) renders its own card fields and does not carry the same PCI
  scope as the Stripe and Braintree samples.

- **`@lf/lf-form-builder` and `@lf/lf-form-types` are no longer treated as published npm packages.**
  They are built from source and consumed through npm workspaces. Dependents declare them as `"*"`,
  which npm resolves to the local copy in `packages/` instead of contacting a registry.
- `template/` is now an npm workspace (added to the root `workspaces` array), so a single
  `npm install` at the repo root links the library into it. Its dependencies changed from `^0.1.0`
  to `"*"`.
- `packages/core` depends on `@lf/lf-form-types` as `"*"` rather than `^0.1.0`.
- Added root scripts `build:template` and `dev:template`.
- Documentation now describes building and referencing the packages locally, including an
  `npm pack` tarball path for projects kept outside this repository.

### Removed

- `.github/workflows/publish.yml` — published both packages to registry.npmjs.org on release.
- `scripts/release.sh` and the root `release` script — bumped versions and rewrote the template and
  examples dependencies back to registry semver ranges.

### Notes

- `version` fields in `packages/core` and `packages/types` are now informational only; nothing
  resolves them by range.

## [0.1.0] - 2026-01-01

### Added

- **Core library** (`@lf/lf-form-builder`)
  - Field utilities: `findField`, `findFieldByIdParam`, `findFieldOrNull` for flexible field lookup
  - Field rules builder: `LFFormFieldRules` class with chainable API for show/hide/CSS actions
  - Conditional rule logic: `when().any()`, `when().all()`, `when().always()` for field dependencies
  
- **Table utilities**
  - `fillTableWithGenericResults` - Populate tables from search results or API responses
  - `setTableFieldValues` - Set table values with row/column ordering options
  - `updateTableRows` - Dynamically resize table row count
  - `generateCSV` - Export table data to CSV format
  
- **API helpers**
  - `resolveEntryIdField` - Resolve entry ID from field or Entry_ID variable
  - `resolveDefaultRepositoryAPIOptions` - Set up default Laserfiche Repository API client
  - `searchAsync` - Repository search wrapper
  - `mapEntryToForm` - Convert repository entry to form field values
  - `patchEntryMetadata` - Update repository entry metadata
  
- **Components**
  - `LFFormModal` - Modal dialog component
  - `fieldFormatter` - Format field values for display
  - `fullFieldHtml` - Generate complete HTML for form fields
  - `starRating` - Star rating input component
  - `makeLoadingBar` - Loading progress bar component
  - Document viewers: `DocView`, `IframeView`
  
- **Vite plugins**
  - `bundleLfless` - Resolve @import statements in .lfless files using package.json exports
  - `disableSharedChunking` - Prevent Rollup vendor chunk splitting
  - `generateDirectoryHtml` - Generate directory listing HTML
  
- **Types package** (`@lf/lf-form-types`)
  - Shared TypeScript definitions for LFForm, LFFormField, FormSettings, FieldSettings
  - Type guards: `isLfFormId`

- **Starter template** - Ready-to-use project structure for consumers with example forms (Empower, Stripe, GoogleMaps, TranslateForm)

- **CI/CD workflows**
  - GitHub Actions: linting, type checking, and test verification on every PR
  - Automated NPM publishing on release tags

- **Documentation**
  - Architecture guide covering module organization and build pipeline
  - Contributing guidelines for local development and testing
  - API documentation in README files
  - Vite plugin usage examples

- **Testing**
  - Comprehensive test suite with 63+ tests covering utilities, API helpers, and field rules
  - High-quality LFForm mock for unit testing
  - Coverage thresholds: 60% lines/functions/statements, 50% branches

### Changed

N/A (initial release)

### Deprecated

N/A (initial release)

### Removed

N/A (initial release)

### Fixed

N/A (initial release)

### Security

N/A (initial release)

---

## Migration Guide

### Upgrading from 0.0.x

This is the first stable release of lf-form-builder. Start with version 0.1.0 or later.

---

## Unreleased

### Planned for Next Release

- Performance monitoring and metrics
- Additional component variants
- Enhanced error types and error messages
- Beta/RC pre-release support
