# LF Form Builder

A toolkit for building Laserfiche Forms customizations with TypeScript, Vite, and reusable components.

> [!IMPORTANT]
> This toolkit is not officially supported by Laserfiche and may break with future updates to Laserfiche Forms.
> Do not open support tickets with Laserfiche for issues related to this toolkit.

## Repository Structure

This is a monorepo with npm workspaces:

```
lf-form-builder/
├── docs/                 # VitePress guides, recipes, and generated API docs
├── packages/
│   ├── core/             # Local workspace package (@lf/lf-form-builder)
│   │   └── src/          # Library source: components, utilities, API helpers, plugins
│   ├── types/            # Local workspace package (@lf/lf-form-types)
│   │   └── src/          # LFForm type definitions and helpers
│   └── examples/         # Real-world example forms
├── template/             # Starter template workspace — copy this to start a new project
```

`@lf/lf-form-builder` and `@lf/lf-form-types` are **not published to any npm registry**. They are
built from source in this repository and consumed through npm workspaces, so every dependent —
`packages/examples` and `template` — resolves them from `packages/` on disk. Their `package.json`
entries use `"*"`, which npm satisfies with the local workspace copy rather than a registry lookup.

### Quick Start (New Project)

The template is a workspace in this repository, so a single install at the repo root wires it to the
locally built library:

```bash
git clone https://github.com/Laserfiche/lf-form-builder.git
cd lf-form-builder

npm install            # links @lf/lf-form-builder and @lf/lf-form-types from packages/
npm run build:core     # build the library the template imports
npm run dev:template   # build + serve the template on http://localhost:3000
```

To start your own project, copy `template/` to a new folder **inside this repository** and add it to
the `workspaces` array in the root `package.json`, then re-run `npm install`:

```bash
cp -r template my-forms-project
```

```jsonc
// package.json
"workspaces": ["packages/*", "template", "my-forms-project"]
```

::: tip Working outside this repository
Because the library is never published, a project kept outside this checkout cannot resolve
`@lf/lf-form-builder` by name. If you need a standalone copy, build and pack the two packages first,
then depend on the tarballs:

```bash
npm run build:core
npm pack --workspace=packages/types --workspace=packages/core --pack-destination ../
```

```jsonc
// my-forms-project/package.json
"dependencies": {
  "@lf/lf-form-builder": "file:../lf-lf-form-builder-0.1.0.tgz",
  "@lf/lf-form-types": "file:../lf-lf-form-types-0.1.0.tgz"
}
```

Re-pack and re-install after each library change.
:::

See [template/README.md](template/README.md) for full documentation.

### Development (Contributing to the Library)

```bash
git clone https://github.com/Laserfiche/lf-form-builder.git
cd lf-form-builder
npm install
copy .env.example .env.local
npm run build:core        # Build the core library
npm run build:examples    # Build example forms
npm run build:dev:css     # Dev build + compile emitted .less to .css for static serving
npm run dev               # Watch examples and serve built dist locally
```

Use `.env.example` as the committed template for local configuration. Keep actual keys and per-machine overrides in the untracked `.env.local`.

After changing `.env.local`, rebuild the examples bundle or restart `npm run dev`. The `VITE_*` values are embedded into the generated JavaScript at build time, so updating the env file alone does not change an already-built `packages/examples/dist/*.js` output.

If you use the translation examples, set `VITE_TRANSLATION_ENDPOINT` to a server-side route that performs translation. Do not expose provider API keys in browser code.

### Watch Mode

For live rebuilds when editing the library or examples, use the repository watch script. It rebuilds `core`, `examples`, and re-compiles emitted `.less` files automatically on save:

```bash
npm install       # first-time only
npm run watch     # rebuilds on file changes
```

## Local Development Modes

Use the workflow that matches what you are testing:

- `npm run dev` — runs the examples workspace `watch` + `serve` scripts. This watches the example build output and serves `packages/examples/dist` on `http://localhost:3000` when that port is available.
- `npm run build:dev:css` — one-shot development build that emits both `Empower2026.js` and `Empower2026.css` into `packages/examples/dist`.
- `npm run watch-serve` — runs the core watcher and a Vite development server on `http://localhost:3000` with `--strictPort`. Use this when you want Vite-hosted development output on a fixed port.

If you want the built `dist` directory served manually from the examples workspace:

```bash
# build once (dev mode) and emit matching .css files into dist
npm run build:dev:css

# serve the built dist on port 3000
npm --workspace=packages/examples run serve
```

Notes:
- `npm run dev` uses the examples package's static `serve` command. If port `3000` is already in use, `serve` will choose another port.
- `npm run build:dev:css` is the easiest one-shot build when you want the static index page to list both `Empower2026.js` and `Empower2026.css`.
- `npm run watch-serve` uses Vite on `--strictPort`, so it will fail instead of switching ports if `3000` is already occupied.
- If you update `.env.local`, run a fresh build or restart `npm run dev` so the new `VITE_*` values are embedded into the built JavaScript.
- If `Empower2026.js` looks truncated, stop the server, run the `build:dev` or `build:dev:css` step to completion, then restart serving.

This is useful during development so you don't need to run `npm run build:core` manually after each change.


### LFForm Documentation

- [Quick Start](docs/guide/quick-start.md) — Writing form scripts with the LFForm API
- [LFForm API Navigation](docs/guide/lfform-api-navigation.md) — Browse the main LFForm API pages in a linear order, then drill into auxiliary types
- [Template & Toolchain Setup](docs/guide/template-setup.md) — Build with Vite and the local workspace packages
- [Custom HTML & Sandbox](docs/guide/custom-html.md) — Custom HTML, third-party libraries, and iframes
- [Recipes](docs/recipes/) — Copy-paste patterns for common form tasks
- [Payment Gateways](docs/recipes/payment-gateways.md) — Setting up Stripe, Braintree, or Authorize.net checkout on a form
- [API Reference](docs/api/) — Generated TypeDoc for `@lf/lf-form-builder` and `@lf/lf-form-types`

## Packages

### `packages/core` — `@lf/lf-form-builder`

The core library published to npm. Import utilities in your form code:

```typescript
import { findField, LFFormModal, fullFieldHtml } from '@lf/lf-form-builder';
```

Import Vite plugins in your build config:

```typescript
import { bundleLfless, disableSharedChunking } from '@lf/lf-form-builder/plugins';
```

**Included modules:**
- **Field utilities** — `findField`, `findFieldByIdParam`, `findFieldOrNull`
- **Field rules** — `LFFormFieldRules` (chainable show/hide/CSS class actions)
- **Safe field helpers** — `showFieldSafe`, `hideFieldSafe`, `setFieldValueSafe`
- **Templates** — `lfjsx` (reactive field content templates)
- **Async and general utilities** — `waitWithTimeout`, `throttle`, `setCustomHtml`
- **Messaging utilities** — `PostMessageHelper` and related message types
- **Table utilities** — `fillTableWithGenericResults`, `setTableFieldValues`, `generateCSV`, `makeCSVDownloadButton`, `makeDownloadTriggerButton`, `updateTableRows`
- **API helpers** — `getRepositories`, `resolveEntryIdField`, `resolveDefaultRepositoryAPIOptions`, `searchAsync`, `fillTableWithSearchResults`, `defaultSearchOptions`, `mapEntryToForm`, `isFieldIdEqualField`, `patchEntryMetadata`, `AdobeSignApi`
- **Components** — `LFFormModal`, `generateFullFieldHtml`, `fullFieldHtml`, `fieldFormatter`, `registerStarHandler`, `registerAllStarComponents`, `handleVoteChange`, `onVoteChange`, `makeLoadingBar`, `registerFirstTimeLoad`
- **Google Maps** — `initGoogleMapsAutocomplete`, `destroyGoogleMapsAutocomplete`, `buildLFAddress`, `initAddressValidation`, `destroyAddressValidation`, `sendValidationFeedback`, `validateAddress`, `validateFeedback`
- **Repository** — `DocView`, `IframeView`
- **Vite plugins** — `bundleLfless`, `disableSharedChunking`, `generateDirectoryHtml`
- **CSS** — LESS variables, mixins, and theme files via `@lf/lf-form-builder/css/*`

See [packages/core/README.md](packages/core/README.md) for package-level usage and plugin details.

### `packages/types` — `@lf/lf-form-types`

TypeScript definitions for the `LFForm` runtime API, including focused subpath exports for the main LFForm API and auxiliary helper types.

```typescript
import type { LFForm, LFFormEventApi, LFFormGetterApi, LFFormMethodApi } from '@lf/lf-form-types/lfform';
import type { LFFormSupportedEvents } from '@lf/lf-form-types/events';
import { isLfFormId } from '@lf/lf-form-types/utils';
```

See [packages/types/README.md](packages/types/README.md) and [docs/guide/lfform-api-navigation.md](docs/guide/lfform-api-navigation.md) for the LFForm-first docs structure.

### `template/`

A minimal starter project configured with Vite, `@lf/lf-form-builder`, and `@lf/lf-form-types`. Copy this directory to start a new forms project.

### `packages/examples/`

Real-world form implementations demonstrating the library in action:
- **Empower2025** — Multi-feature form: modals, star ratings, table HTML injection
- **Empower2026** — lookup-driven loading and CSV export, Google Maps autocomplete with address validation, modal-based checkout via Stripe, Braintree, or Authorize.net, cross-iframe messaging
- **TranslateForm** — static form localization with optional translation draft generation

#### Empower2026 Setup

Empower2026 ships three interchangeable payment-gateway pages, each independently toggleable via a `VITE_DISABLE_PAGE*` flag in `.env.local`:

| Page | File | Gateway | Feature flag |
| --- | --- | --- | --- |
| Page 3 | [page3Payment.ts](packages/examples/src/Forms/Empower2026/page3Payment.ts) | Stripe (embedded checkout) | `VITE_DISABLE_PAGE3` |
| Page 4 | [page4BraintreePayment.ts](packages/examples/src/Forms/Empower2026/page4BraintreePayment.ts) | Braintree (Drop-in UI) | `VITE_DISABLE_PAGE4` |
| Page 5 | [page5AuthorizeNetPayment.ts](packages/examples/src/Forms/Empower2026/page5AuthorizeNetPayment.ts) | Authorize.net (Accept.js) | `VITE_DISABLE_PAGE5` |

See [docs/recipes/payment-gateways.md](docs/recipes/payment-gateways.md) for the full setup and field-mapping guide for all three gateways.

Before using the Empower2026 example in your own Forms account, import the bundled Laserfiche assets from [packages/examples/src/Forms/Empower2026/Laserfiche Process](packages/examples/src/Forms/Empower2026/Laserfiche%20Process):

- Import the process definition: [AdvancedScripting_RG.xml](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/AdvancedScripting_RG.xml)
- For Stripe (page 3), import the web request rules: [RGWebRequestToStripeCharge.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToStripeCharge.bri) and [RGWebRequestToStripeVerification.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToStripeVerification.bri)
- For Braintree (page 4), import: [RGWebRequestToBraintreePaymentIInit.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToBraintreePaymentIInit.bri) (creates the client_token) and [RGWebRequestToBraintreeCharge.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToBraintreeCharge.bri) (charges the nonce)
- For Authorize.net (page 5), import: [RGWebRequestToAuthNetCharge.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToAuthNetCharge.bri) and [RGWebRequestToAuthNetVerification.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToAuthNetVerification.bri)

You only need to import the web request rules for the gateway(s) you intend to use; disable the others via their `VITE_DISABLE_PAGE*` flag.

Those imports are required for the example's process actions and gateway-related web requests to work in your environment.

The bundled process assets are configured for local development and expect the example scripts to be served from `http://localhost:3000`. That is appropriate for getting the demo running quickly on a developer machine.

For the payment gateways specifically, do not copy only `Empower2026.js`. Each checkout flow injects an iframe pointed back at the currently-loaded page (with the built script re-delivered into that iframe over `postMessage`), so `Empower2026.js` must be reachable at the same URL the form iframe loads — there is no separate `stripe.html`/`Stripe.js` asset to copy alongside it. In local development that URL is served from `packages/examples/dist`, and in production it should be hosted on the same HTTPS location referenced by the form.

For production, do not leave the process pointed at `localhost`. Host the built JavaScript, CSS, and related assets on a secure HTTPS site that your Forms environment can reach, then update the imported process and form configuration to reference that hosted location.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/prebuilt-installer) (v22+)
- [VS Code](https://code.visualstudio.com/download) (recommended)
- [Git](https://git-scm.com/downloads)

## Validating the Workspace

There is no publish step — the packages are consumed locally. To confirm the whole workspace is
healthy after a change:

```bash
npm run build:types
npm run build:core
npm run build:examples
npm run build:template

npm run lint
npm run typecheck
npm test
```

Versions in `packages/core/package.json` and `packages/types/package.json` are informational only.
Nothing resolves them by range, so bumping them is optional and requires no dependent updates.