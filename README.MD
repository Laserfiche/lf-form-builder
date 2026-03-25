# LF Form Builder

A toolkit for building Laserfiche Forms customizations with TypeScript, Vite, and reusable components.

> [!IMPORTANT]
> This toolkit is not officially supported by Laserfiche and may break with future updates to Laserfiche Forms.
> Do not open support tickets with Laserfiche for issues related to this toolkit.

## Repository Structure

This is a monorepo with npm workspaces:

```
lf-form-builder/
├── packages/
│   ├── core/             # Published npm package (lf-form-builder)
│   │   ├── src/          # Library source: components, utilities, API helpers
│   │   └── plugins/      # Vite plugins for form bundling
│   └── examples/         # Real-world example forms (not published)
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
git clone <repo-url>
cd lf-form-builder
npm install
npm run build:core        # Build the core library
npm run build:examples    # Build example forms
npm run dev               # Watch + serve examples
```

## Packages

### `packages/core` — `lf-form-builder`

The core library published to npm. Import utilities in your form code:

```typescript
import { findField, LFFormModal, fullFieldHtml } from 'lf-form-builder';
```

Import Vite plugins in your build config:

```typescript
import { bundleLfless, disableSharedChunking } from 'lf-form-builder/plugins';
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
- **CSS** — LESS variables, mixins, and theme files via `lf-form-builder/css/*`

### `template/`

A minimal starter project configured with Vite and the `lf-form-builder` package. Copy this directory to start a new forms project.

### `packages/examples/`

Real-world form implementations demonstrating the library in action:
- **Empower2025** — Multi-feature form: modals, star ratings, table HTML injection
- **Empower2026** — Google Maps autocomplete, Stripe checkout, cross-iframe messaging
- **GoogleMaps** — Address autocomplete and validation
- **Stripe** — Embedded Stripe checkout via PostMessage
- **TranslateForm** — Form localization/translation

## Prerequisites

- [Node.js](https://nodejs.org/en/download/prebuilt-installer) (v18+)
- [VS Code](https://code.visualstudio.com/download) (recommended)
- [Git](https://git-scm.com/downloads)