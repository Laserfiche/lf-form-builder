# Copilot Instructions

This repository is a monorepo for Laserfiche Forms tooling.

## Monorepo structure

- `packages/core` publishes `@lf/lf-form-builder`
- `packages/types` publishes `@lf/lf-form-types`
- `packages/examples` contains internal example forms (not published)
- `template` is starter boilerplate for consumers

## Canonical package imports

Use the scoped package names in all code and documentation examples.

- `@lf/lf-form-builder`
- `@lf/lf-form-builder/plugins`
- `@lf/lf-form-builder/css/*`
- `@lf/lf-form-types`

Do not use unscoped `lf-form-builder` in this repo.

## Release and versioning notes

- Keep docs aligned with the real export surface from `packages/core/src/index.ts`.
- Keep template docs aligned with starter behavior and scripts in `template/package.json`.
- For template dependency examples, prefer semver ranges to current stable releases.
- Validate release prep changes with:
  - `npm run build:types`
  - `npm run build:core`
  - `npm run build:examples`

## Template sync rule

When adding, renaming, or removing public utilities/plugins/types:

1. Update exports in `packages/core/src/index.ts`.
2. Update package docs (`packages/core/README.md`, `packages/types/README.md`).
3. Update root docs (`README.MD`).
4. Update starter docs and usage snippets (`template/README.md`, starter sample files).

## Editing guidance

- Preserve existing project style and avoid unrelated refactors.
- Keep release docs practical and command-accurate.
- Prefer incremental, verifiable changes over broad rewrites.
