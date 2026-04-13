---
title: Template & Toolchain Setup
description: Getting started with the lf-form-builder starter template, Vite, and the npm packages.
---

# Template & Toolchain Setup

This guide walks you through creating a new Laserfiche Forms project using the starter template, building form scripts with Vite, and using the `@lfz/lf-form-builder` library.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/prebuilt-installer) (v18+)
- [Git](https://git-scm.com/downloads)
- [VS Code](https://code.visualstudio.com/download) (recommended)

## Create a New Project

Copy the starter template and install dependencies:

```bash
npx degit laserfiche/lf-form-builder/template my-forms-project
cd my-forms-project
npm install
```

## Project Structure

```
my-forms-project/
├── src/
│   └── Forms/           # Your form scripts live here
├── dist/                # Built output
├── laserfiche.config.json
├── vite.config.ts
└── package.json
```

## Add a New Form

1. Create a new folder in `src/Forms/` with your form name.
2. Add an `index.ts` entry file.
3. Register it in `laserfiche.config.json`:

```json
{
  "forms": {
    "rootDir": "src/Forms",
    "js": {
      "MyNewForm": "MyNewForm/index.ts"
    }
  }
}
```

## Development Mode

Run the dev server to watch for changes:

```bash
npm run dev
```

This watches for changes and serves built files from `dist/` on `http://localhost:3000`.

For HTTPS development:

```bash
npm run sdev
```

::: tip
If using HTTPS, you may need to generate a self-signed certificate first:
```bash
npm run make-cert
```
:::

## Build for Production

```bash
npm run build
```

Output files are in `dist/`. Copy the JS content into the Laserfiche Forms JS pane.

## Using Library Utilities

Import helpers from `@lfz/lf-form-builder`:

```typescript
import { findField, LFFormModal, fullFieldHtml } from '@lfz/lf-form-builder';
```

Available modules:

- **Field utilities** — `findField`, `findFieldByIdParam`, `findFieldOrNull`
- **Field rules** — `LFFormFieldRules` (show/hide/CSS class chaining)
- **Templates** — `lfjsx` (reactive field content templates)
- **Table utilities** — `fillTableWithGenericResults`, `setTableFieldValues`, `generateCSV`, `updateTableRows`
- **API helpers** — `getRepositories`, `searchAsync`, `mapEntryToForm`, `patchEntryMetadata`
- **Components** — `LFFormModal`, `fullFieldHtml`, `fieldFormatter`, `registerStarHandler`, `makeLoadingBar`
- **Repository** — `DocView`, `IframeView`

## Using LFForm Types

`LFForm` is provided at runtime by Laserfiche Forms. In TypeScript, use `@lfz/lf-form-types` for compile-time safety:

```typescript
import type { LFForm, LFFormIdParam } from '@lfz/lf-form-types';
import { findFieldOrNull } from '@lfz/lf-form-builder';

const lfForm: LFForm = window.LFForm;

const fields = {
  employeeName: { fieldId: 1 },
} as const satisfies Record<string, LFFormIdParam>;

const employeeNameField = findFieldOrNull(fields.employeeName);
if (!employeeNameField) {
  console.warn('employeeName field not found');
}

void lfForm;
```

For larger projects, you can use focused type subpaths:

```typescript
import type { LFForm, LFFormEventApi, LFFormGetterApi, LFFormMethodApi } from '@lfz/lf-form-types/lfform';
import type { LFFormSupportedEvents } from '@lfz/lf-form-types/events';
import type { LFFormGetFieldValues } from '@lfz/lf-form-types/getters';
import type { LFFormSetFieldValues } from '@lfz/lf-form-types/methods';
```

Template global typing is declared in `src/global.d.ts` so `window.LFForm` and `LFForm` are typed automatically.

## Working with Custom HTML Fields

Use the `lfjsx` helper to create reactive custom HTML:

```typescript
import { lfjsx } from '@lfz/lf-form-builder';

const watchField = { fieldId: 4 };
const customField = lfjsx({ fieldId: 3 }, 'textAbove')/*html*/`
  <div>
    <label>The value of field 4 is:</label>
    <span>${watchField}</span>
  </div>
`;
```

## Custom Styles (LESS)

Import `.lfless` files from the package for base styles:

```less
@import '@lfz/lf-form-builder/css/form-theme.lfless';
```

Create your own `.lfless` files alongside your form code — they will be bundled automatically by the `bundleLfless` Vite plugin.

## Adding npm Dependencies

```bash
npm install <package-name>
```

If a dependency has a CDN URL, add it to the Forms external JS pane and list it in the `external` array in `vite.config.ts` to exclude it from the bundle.

## Vite Plugins

Import build plugins in your `vite.config.ts`:

```typescript
import { bundleLfless, disableSharedChunking } from '@lfz/lf-form-builder/plugins';
```

- **bundleLfless** — Resolves and bundles `.lfless` style imports
- **disableSharedChunking** — Prevents Vite from splitting shared code into separate chunks
- **generateDirectoryHtml** — Generates directory listing views

## Where to Go Next

- [LFForm Quick Start](./quick-start.md) — Writing form scripts with the LFForm API
- [Custom HTML & Sandbox](./custom-html.md) — Using custom HTML, third-party libraries, and iframes
- [Recipes](/recipes/) — Copy-paste patterns for common form tasks
