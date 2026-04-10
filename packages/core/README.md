# @lfz/lf-form-builder

Utilities, components, and Vite plugins for building custom Laserfiche Forms.

## Installation

```bash
npm install @lfz/lf-form-builder
```

## What's included

### Utilities

- **`findField`** / **`findFieldByIdParam`** — Locate form fields by ID, variable name, or CSS class
- **`LFFormFieldRules`** — Declarative field rule engine
- **`throttle`** — Throttle function calls
- **`lfjsx`** — Lightweight JSX-like DOM builder

### Table helpers

- **`fillTableWithGenericResults`** — Populate table fields from API data
- **`setTableFieldValues`** — Batch-set table cell values
- **`generateCSV`** / **`makeCSVDownloadButton`** / **`makeDownloadTriggerButton`** — Export table field data to CSV
- **`updateTableRows`** — Sync table rows with external data

### API wrappers

- **Repository** — Laserfiche repository operations (search, template mapping, entry metadata)
- **Adobe Sign** — Integration helpers

### Components

- **`fieldFormatter`** — Format field display values
- **`fullFieldHtml`** — Render full field markup
- **`makeLoadingBar`** — Loading indicator
- **`starRating`** — Star rating input
- **Modal** — Modal dialog component
- **DocView / IframeView** — Repository document viewers

### Vite plugins

```js
import { bundleLfless, disableSharedChunking, generateDirectoryHtml } from '@lfz/lf-form-builder/plugins';
```

- **`bundleLfless`** — Compile `.lfless` (LESS variant) stylesheets per form entry
- **`disableSharedChunking`** — Keep each form as a self-contained bundle
- **`generateDirectoryHtml`** — Auto-generate an index page listing all form entries

## Why This Package Builds With Vite

`@lfz/lf-form-builder` uses Vite for library packaging because the build needs behavior beyond plain `tsc` transpilation:

- Multi-entry ESM output with preserved module structure for package subpath exports (for example, `./plugins/*`)
- Build-time plugin hooks that preserve style imports and copy `.lfless` / `.css` assets into `dist`
- Declaration generation integrated with the final Vite output layout via `vite-plugin-dts`

TypeScript project builds (`tsc -b`) are still used for type-checking workflows, but they do not replace the packaging and asset pipeline used for publishing this package.

### CSS

Import base styles in your `.lfless` files:

```less
@import '@lfz/lf-form-builder/css/form-theme.lfless';
```

## Quick start

See the [template/](../../template/) directory for a ready-to-use starter project.

## License

[MIT](../../LICENSE)
