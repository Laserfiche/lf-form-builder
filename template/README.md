# Laserfiche Forms Builder — Starter Template

## Prerequisites

- Node.js 22+
- Git

> [!IMPORTANT]
> This template depends on `@lf/lf-form-builder` and `@lf/lf-form-types`, which are **not published to
> an npm registry**. They are built from source in this repository and linked via npm workspaces, so
> this template must live inside the repository (as a registered workspace) for `npm install` to
> resolve them. See "Using this template outside the repository" below if you need a standalone copy.

## Getting Started

1. **Clone the repository and install from the root:**
   ```bash
   git clone https://github.com/Laserfiche/lf-form-builder.git
   cd lf-form-builder
   npm install
   npm run build:core
   ```

2. **Copy this template into your own project folder and register it as a workspace:**
   ```bash
   cp -r template my-forms-project
   ```
   ```jsonc
   // package.json (repo root)
   "workspaces": ["packages/*", "template", "my-forms-project"]
   ```
   ```bash
   npm install   # links @lf/lf-form-builder and @lf/lf-form-types into my-forms-project
   ```

   To run this template as-is instead, use `npm run dev:template` from the repo root.

3. **Add a new form:**
   - Create a new folder in `src/Forms/` with your form name
   - Add an `index.ts` entry file
   - Register it in `laserfiche.config.json`:
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

4. **Run in development mode:**
   ```bash
   npm run dev
   ```
   This watches for changes and serves built files from `dist/` on `http://localhost:3000`.
   
   or for HTTPS development mode:
   ```bash
   npm run sdev
   ```
   *Note: If you are using HTTPS in development, you may need to run `npm run make-cert` to generate a self-signed certificate.*


5. **Build for production:**
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

## Using LFForm and LFForm Types

`LFForm` is provided at runtime by Laserfiche Forms. In TypeScript, use `@lf/lf-form-types` for compile-time safety.

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

Template global typing is declared in `src/global.d.ts` so `window.LFForm` and `LFForm` are typed automatically.

For larger codebases, you can mirror the docs structure with focused subpath imports:

```typescript
import type { LFForm, LFFormEventApi, LFFormGetterApi, LFFormMethodApi } from '@lf/lf-form-types/lfform';
import type { LFFormSupportedEvents } from '@lf/lf-form-types/events';
import type { LFFormGetFieldValues } from '@lf/lf-form-types/getters';
import type { LFFormSetFieldValues } from '@lf/lf-form-types/methods';
```

See `../docs/guide/lfform-api-navigation.md` for the matching docs layout.

## Adding npm Dependencies

Because this project is an npm workspace, install third-party packages from the repository root and
target this workspace by name so the dependency is recorded in the right `package.json`:

```bash
npm install <package-name> --workspace=my-forms-project
```

If a dependency has a CDN URL, add it to the Forms external JS pane and list it in the `external` array in `vite.config.ts` to exclude it from the bundle.

## Using this template outside the repository

`@lf/lf-form-builder` and `@lf/lf-form-types` are not on any registry, so a copy of this template kept
elsewhere on disk cannot resolve them by name. Build and pack them, then depend on the tarballs:

```bash
# in the lf-form-builder checkout
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

```bash
cd my-forms-project && npm install
```

You must re-pack and re-install after every library change, which is why keeping the project as a
workspace inside the repository is the recommended path.

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

## Dependency Version Policy

This starter uses semver ranges for stable package releases:

- `@lf/lf-form-builder`
- `@lf/lf-form-types`

When creating new projects from this template, keep these as ranges to receive compatible updates.
