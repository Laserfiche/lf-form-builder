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
│   ├── core/             # Published npm package (@lf/lf-form-builder)
│   │   └── src/          # Library source: components, utilities, API helpers, plugins
│   ├── types/            # Published npm package (@lf/lf-form-types)
│   │   └── src/          # LFForm type definitions and helpers
│   └── examples/         # Real-world example forms (not published)
├── scripts/              # Release and workspace helper scripts
├── template/             # Starter template — clone this to start a new project
```

### Quick Start (New Project)

Copy the starter template and start building:

```bash
npx degit laserfiche/lf-form-builder/template my-forms-project
cd my-forms-project
npm install
npm run dev
```

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
- If `Empower2026.js` looks truncated, stop the server, run the `build:dev` or `build:dev:css` step to completion, then restart serving.

This is useful during development so you don't need to run `npm run build:core` manually after each change.


### LFForm Documentation

- [Quick Start](docs/guide/quick-start.md) — Writing form scripts with the LFForm API
- [LFForm API Navigation](docs/guide/lfform-api-navigation.md) — Browse the main LFForm API pages in a linear order, then drill into auxiliary types
- [Template & Toolchain Setup](docs/guide/template-setup.md) — Build with Vite and the npm packages
- [Custom HTML & Sandbox](docs/guide/custom-html.md) — Custom HTML, third-party libraries, and iframes
- [Recipes](docs/recipes/) — Copy-paste patterns for common form tasks
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
- **Empower2026** — lookup-driven loading and CSV export, Google Maps autocomplete with address validation, modal-based Stripe checkout, cross-iframe messaging
- **TranslateForm** — static form localization with optional translation draft generation

#### Empower2026 Setup

Before using the Empower2026 example in your own Forms account, import the bundled Laserfiche assets from [packages/examples/src/Forms/Empower2026/Laserfiche Process](packages/examples/src/Forms/Empower2026/Laserfiche%20Process):

- Import the process definition: [packages/examples/src/Forms/Empower2026/Laserfiche Process/AdvancedScripting_RG.xml](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/AdvancedScripting_RG.xml)
- Import the web request rules: [packages/examples/src/Forms/Empower2026/Laserfiche Process/RGWebRequestToStripePayment.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToStripePayment.bri) and [packages/examples/src/Forms/Empower2026/Laserfiche Process/RGWebRequestToStripeVerification.bri](packages/examples/src/Forms/Empower2026/Laserfiche%20Process/RGWebRequestToStripeVerification.bri)

Those imports are required for the example's process actions and Stripe-related web requests to work in your environment.

The bundled process assets are configured for local development and expect the example scripts to be served from `http://localhost:3000`. That is appropriate for getting the demo running quickly on a developer machine.

For the payment gateway specifically, do not copy only `Empower2026.js`. The checkout flow also depends on the companion Stripe runtime assets that are emitted alongside it, including `stripe.html` and `Stripe.js`. In local development those files are served from the same `packages/examples/dist` folder, and in production they should be hosted together at the same HTTPS location.

For production, do not leave the process pointed at `localhost`. Host the built JavaScript, CSS, and related assets on a secure HTTPS site that your Forms environment can reach, then update the imported process and form configuration to reference that hosted location.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/prebuilt-installer) (v20+)
- [VS Code](https://code.visualstudio.com/download) (recommended)
- [Git](https://git-scm.com/downloads)

## Release Checklist

Before preparing a release, validate the workspace builds:

```bash
npm run build:types
npm run build:core
npm run build:examples
```

Then run:

```bash
npm run release
```

This script bumps the published package versions, aligns internal dependency ranges used by the examples and template, creates a release commit, and tags the version.