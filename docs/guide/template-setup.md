---
title: Template & Toolchain Setup
description: Getting started with the lf-form-builder starter template, Vite, and the local workspace packages.
---

# Template & Toolchain Setup

This guide walks you through creating a new Laserfiche Forms project using the starter template, building form scripts with Vite, and using the `@lf/lf-form-builder` library.

::: warning `@lf/lf-form-builder` is not on npm
`@lf/lf-form-builder` and `@lf/lf-form-types` are **not published to any npm registry**. They are built
from source in the `lf-form-builder` repository and consumed through npm workspaces. `npm install @lf/lf-form-builder`
will not work — you build the library locally and let npm link it. Everything below assumes you are
working inside a clone of the repository.
:::

## Prerequisites

- [Node.js](https://nodejs.org/en/download/prebuilt-installer) (v22+)
- [Git](https://git-scm.com/downloads)
- [VS Code](https://code.visualstudio.com/download) (recommended)

## Create a New Project

Clone the repository and install once at the root. This builds the workspace links that let the
template resolve `@lf/lf-form-builder` and `@lf/lf-form-types` from `packages/` on disk:

```bash
git clone https://github.com/Laserfiche/lf-form-builder.git
cd lf-form-builder
npm install
npm run build:core
```

Copy the template to your own project folder **inside the repository**, then register it as a
workspace so npm links the library into it:

```bash
cp -r template my-forms-project
```

```jsonc
// package.json (repo root)
"workspaces": ["packages/*", "template", "my-forms-project"]
```

```bash
npm install                              # links @lf/* into my-forms-project
npm run build --workspace=my-forms-project
npm run dev --workspace=my-forms-project
```

To try the template as-is without copying it, `npm run dev:template` from the repo root does the
build-core-then-serve step in one command.

::: tip Keeping a project outside the repository
Since the packages are never published, a project stored elsewhere cannot resolve them by name. Build
and pack them, then depend on the tarballs:

```bash
npm run build:core
npm pack --workspace=packages/types --workspace=packages/core --pack-destination /path/to/parent
```

```jsonc
// my-forms-project/package.json
"dependencies": {
  "@lf/lf-form-builder": "file:../lf-lf-form-builder-0.1.0.tgz",
  "@lf/lf-form-types": "file:../lf-lf-form-types-0.1.0.tgz"
}
```

Re-pack and re-install after each library change, or keep the project in the workspace to avoid the step.
:::

## Project Structure

```
my-forms-project/
├── src/
│   └── Forms/           # Your form scripts live here
├── dist/                # Built output
├── laserfiche.config.json
├── vite.config.ts
└── package.json         # @lf/* dependencies declared as "*"
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

Import helpers from `@lf/lf-form-builder`:

```typescript
import { findField, LFFormModal, fullFieldHtml } from '@lf/lf-form-builder';
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

`LFForm` is provided at runtime by Laserfiche Forms. In TypeScript, use `@lf/lf-form-types` for compile-time safety:

```typescript
import type { LFForm, LFFormIdParam } from '@lf/lf-form-types';
import { findFieldOrNull } from '@lf/lf-form-builder';

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
import type { LFForm, LFFormEventApi, LFFormGetterApi, LFFormMethodApi } from '@lf/lf-form-types/lfform';
import type { LFFormSupportedEvents } from '@lf/lf-form-types/events';
import type { LFFormGetFieldValues } from '@lf/lf-form-types/getters';
import type { LFFormSetFieldValues } from '@lf/lf-form-types/methods';
```

Template global typing is declared in `src/global.d.ts` so `window.LFForm` and `LFForm` are typed automatically.

## Working with Custom HTML Fields

Use the `lfjsx` helper to create reactive custom HTML:

```typescript
import { lfjsx } from '@lf/lf-form-builder';

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
@import '@lf/lf-form-builder/css/form-theme.lfless';
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
import { bundleLfless, disableSharedChunking } from '@lf/lf-form-builder/plugins';
```

- **bundleLfless** — Resolves and bundles `.lfless` style imports
- **disableSharedChunking** — Prevents Vite from splitting shared code into separate chunks
- **generateDirectoryHtml** — Generates directory listing views

## Where to Go Next

- [LFForm Quick Start](./quick-start.md) — Writing form scripts with the LFForm API
- [Custom HTML & Sandbox](./custom-html.md) — Using custom HTML, third-party libraries, and iframes
- [Recipes](/recipes/) — Copy-paste patterns for common form tasks
