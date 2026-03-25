# Laserfiche Forms Builder — Starter Template

## Getting Started

1. **Clone or copy this template:**
   ```bash
   npx degit laserfiche/lf-form-builder/template my-forms-project
   cd my-forms-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

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

Import helpers from the `lf-form-builder` package:

```typescript
import { findField, LFFormModal, fullFieldHtml } from 'lf-form-builder';
```

Available modules:
- **Field utilities** — `findField`, `findFieldByIdParam`, `findFieldOrNull`
- **Field rules** — `LFFormFieldRules` (show/hide/CSS class chaining)
- **Templates** — `lfjsx` (reactive field content templates)
- **Table utilities** — `fillTableWithGenericResults`, `setTableFieldValues`, `generateCSV`, `updateTableRows`
- **API helpers** — `getRepositories`, `searchAsync`, `mapEntryToForm`, `patchEntryMetadata`
- **Components** — `LFFormModal`, `fullFieldHtml`, `fieldFormatter`, `registerStarHandler`, `makeLoadingBar`
- **Repository** — `DocView`, `IframeView`

## Adding npm Dependencies

```bash
npm install <package-name>
```

If a dependency has a CDN URL, add it to the Forms external JS pane and list it in the `external` array in `vite.config.ts` to exclude it from the bundle.

## Working with Custom HTML Fields

Use the `lfjsx` helper to create reactive custom HTML:

```typescript
import { lfjsx } from 'lf-form-builder';

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
@import 'lf-form-builder/css/form-theme.lfless';
```

Create your own `.lfless` files alongside your form code — they will be bundled automatically by the `bundleLfless` Vite plugin.
