[Documentation](../../index.md) / @lfz/lf-form-builder

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

#### Using `bundleLfless`

The `bundleLfless` plugin enables LESS stylesheets (`.lfless` files) to use `@import` statements that resolve through the package's export map. This allows shared style organization:

**Example setup**:

```js
// vite.config.ts
import { defineConfig } from 'vite';
import { bundleLfless } from '@lfz/lf-form-builder/plugins';

export default defineConfig({
  plugins: [bundleLfless()],
});
```

**Usage in .lfless files**:

```less
// src/css/components.lfless
@import '@lfz/lf-form-builder/css/variables.lfless';
@import '@lfz/lf-form-builder/css/form-theme.lfless';

.my-field {
  background: @primary-color;
  padding: @base-spacing;
}
```

The plugin resolves these imports by looking up the package.json `exports` map, allowing you to:
- Share common styles across multiple forms
- Version styles independently from form code
- Keep form-specific overrides in separate files

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

See the [template/](../../_media/template) directory for a ready-to-use starter project.

## License

[MIT](../../_media/LICENSE)

## Modules

- [](README.md)
- [plugins](plugins/index.md)
- [plugins/bundleLfless](plugins/bundleLfless/index.md)
- [plugins/disableSharedChunking](plugins/disableSharedChunking/index.md)
- [plugins/generateDirectoryHtml](plugins/generateDirectoryHtml/index.md)
- [plugins/index](plugins/index/index.md)
