# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-01

### Added

- **Core library** (`@lf/lf-form-builder`)
  - Field utilities: `findField`, `findFieldByIdParam`, `findFieldOrNull` for flexible field lookup
  - Field rules builder: `LFFormFieldRules` class with chainable API for show/hide/CSS actions
  - Conditional rule logic: `when().any()`, `when().all()`, `when().always()` for field dependencies
  
- **Table utilities**
  - `fillTableWithGenericResults` - Populate tables from search results or API responses
  - `setTableFieldValues` - Set table values with row/column ordering options
  - `updateTableRows` - Dynamically resize table row count
  - `generateCSV` - Export table data to CSV format
  
- **API helpers**
  - `resolveEntryIdField` - Resolve entry ID from field or Entry_ID variable
  - `resolveDefaultRepositoryAPIOptions` - Set up default Laserfiche Repository API client
  - `searchAsync` - Repository search wrapper
  - `mapEntryToForm` - Convert repository entry to form field values
  - `patchEntryMetadata` - Update repository entry metadata
  
- **Components**
  - `LFFormModal` - Modal dialog component
  - `fieldFormatter` - Format field values for display
  - `fullFieldHtml` - Generate complete HTML for form fields
  - `starRating` - Star rating input component
  - `makeLoadingBar` - Loading progress bar component
  - Document viewers: `DocView`, `IframeView`
  
- **Vite plugins**
  - `bundleLfless` - Resolve @import statements in .lfless files using package.json exports
  - `disableSharedChunking` - Prevent Rollup vendor chunk splitting
  - `generateDirectoryHtml` - Generate directory listing HTML
  
- **Types package** (`@lf/lf-form-types`)
  - Shared TypeScript definitions for LFForm, LFFormField, FormSettings, FieldSettings
  - Type guards: `isLfFormId`

- **Starter template** - Ready-to-use project structure for consumers with example forms (Empower, Stripe, GoogleMaps, TranslateForm)

- **CI/CD workflows**
  - GitHub Actions: linting, type checking, and test verification on every PR
  - Automated NPM publishing on release tags

- **Documentation**
  - Architecture guide covering module organization and build pipeline
  - Contributing guidelines for local development and testing
  - API documentation in README files
  - Vite plugin usage examples

- **Testing**
  - Comprehensive test suite with 63+ tests covering utilities, API helpers, and field rules
  - High-quality LFForm mock for unit testing
  - Coverage thresholds: 60% lines/functions/statements, 50% branches

### Changed

N/A (initial release)

### Deprecated

N/A (initial release)

### Removed

N/A (initial release)

### Fixed

N/A (initial release)

### Security

N/A (initial release)

---

## Migration Guide

### Upgrading from 0.0.x

This is the first stable release of lf-form-builder. Start with version 0.1.0 or later.

---

## Unreleased

### Planned for Next Release

- Performance monitoring and metrics
- Additional component variants
- Enhanced error types and error messages
- Beta/RC pre-release support
