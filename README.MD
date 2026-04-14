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
│   ├── core/             # Published npm package (@lfz/lf-form-builder)
│   │   └── src/          # Library source: components, utilities, API helpers, plugins
│   ├── types/            # Published npm package (@lfz/lf-form-types)
│   │   └── src/          # LFForm type definitions and helpers
│   └── examples/         # Real-world example forms (not published)
├── template/             # Starter template — clone this to start a new project
```

### Quick Start (New Project)

Copy the starter template and start building:

```bash
npx degit laserfiche/lfz-form-builder/template my-forms-project
cd my-forms-project
npm install
npm run dev
```

See [template/README.md](template/README.md) for full documentation.

### Development (Contributing to the Library)

```bash
git clone https://github.com/Laserfiche/lfz-form-builder.git
cd lf-form-builder
npm install
npm run build:core        # Build the core library
npm run build:examples    # Build example forms
npm run dev               # Watch + serve examples
```

### LFForm Documentation

- [Quick Start](docs/guide/quick-start.md) — Writing form scripts with the LFForm API
- [LFForm API Navigation](docs/guide/lfform-api-navigation.md) — Browse the main LFForm API pages in a linear order, then drill into auxiliary types
- [Template & Toolchain Setup](docs/guide/template-setup.md) — Build with Vite and the npm packages
- [Custom HTML & Sandbox](docs/guide/custom-html.md) — Custom HTML, third-party libraries, and iframes
- [Recipes](docs/recipes/) — Copy-paste patterns for common form tasks
- [API Reference](docs/api/) — Generated TypeDoc for `@lfz/lf-form-builder` and `@lfz/lf-form-types`

## Packages

### `packages/core` — `@lfz/lf-form-builder`

The core library published to npm. Import utilities in your form code:

```typescript
import { findField, LFFormModal, fullFieldHtml } from '@lfz/lf-form-builder';
```

Import Vite plugins in your build config:

```typescript
import { bundleLfless, disableSharedChunking } from '@lfz/lf-form-builder/plugins';
```

**Included modules:**
- **Field utilities** — `findField`, `findFieldByIdParam`, `findFieldOrNull`
- **Field rules** — `LFFormFieldRules` (chainable show/hide/CSS class actions)
- **Templates** — `lfjsx` (reactive field content templates)
- **Table utilities** — `fillTableWithGenericResults`, `setTableFieldValues`, `generateCSV`, `updateTableRows`
- **API helpers** — `getRepositories`, `searchAsync`, `mapEntryToForm`, `patchEntryMetadata`
- **Components** — `LFFormModal`, `fullFieldHtml`, `fieldFormatter`, `registerStarHandler`, `makeLoadingBar`
- **Repository** — `DocView`, `IframeView`
- **Vite plugins** — `bundleLfless`, `disableSharedChunking`, `generateDirectoryHtml`
- **CSS** — LESS variables, mixins, and theme files via `@lfz/lf-form-builder/css/*`

See [packages/core/README.md](packages/core/README.md) for package-level usage and plugin details.

### `packages/types` — `@lfz/lf-form-types`

TypeScript definitions for the `LFForm` runtime API, including focused subpath exports for the main LFForm API and auxiliary helper types.

```typescript
import type { LFForm, LFFormEventApi, LFFormGetterApi, LFFormMethodApi } from '@lfz/lf-form-types/lfform';
import type { LFFormSupportedEvents } from '@lfz/lf-form-types/events';
import { isLfFormId } from '@lfz/lf-form-types/utils';
```

See [packages/types/README.md](packages/types/README.md) and [docs/guide/lfform-api-navigation.md](docs/guide/lfform-api-navigation.md) for the LFForm-first docs structure.

### `template/`

A minimal starter project configured with Vite, `@lfz/lf-form-builder`, and `@lfz/lf-form-types`. Copy this directory to start a new forms project.

### `packages/examples/`

Real-world form implementations demonstrating the library in action:
- **Empower2025** — Multi-feature form: modals, star ratings, table HTML injection
- **Empower2026** — Google Maps autocomplete, Stripe checkout, cross-iframe messaging
- **GoogleMaps** — Address autocomplete and validation
- **Stripe** — Embedded Stripe checkout via PostMessage
- **TranslateForm** — Form localization/translation

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

This script bumps `packages/types` and `packages/core`, creates a release commit, and tags the version.