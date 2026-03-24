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

- **`fillTableWithResults`** — Populate table fields from API data
- **`setFieldValues`** — Batch-set table cell values
- **`tableToCSV`** — Export table field data to CSV
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

### CSS

Import base styles in your `.lfless` files:

```less
@import '@lfz/lf-form-builder/css/form-theme.lfless';
```

## Quick start

See the [template/](../../template/) directory for a ready-to-use starter project.

## License

[MIT](../../LICENSE)
