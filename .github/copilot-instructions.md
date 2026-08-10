# Copilot Instructions

This repository is a monorepo for Laserfiche Forms tooling.

## Monorepo structure

- `packages/core` builds `@lf/lf-form-builder`
- `packages/types` builds `@lf/lf-form-types`
- `packages/examples` contains internal example forms
- `template` is starter boilerplate for consumers

All four are npm workspaces listed in the root `package.json`. Neither `@lf/lf-form-builder` nor
`@lf/lf-form-types` is published to an npm registry — dependents declare them as `"*"` and npm links
them from `packages/`. Never suggest `npm install @lf/lf-form-*`, a registry URL, or a semver range
for these two packages.

## Canonical package imports

Use the scoped package names in all code and documentation examples.

- `@lf/lf-form-builder`
- `@lf/lf-form-builder/plugins`
- `@lf/lf-form-builder/css/*`
- `@lf/lf-form-types`

Do not use unscoped `lf-form-builder` in this repo.

## Versioning notes

- Keep docs aligned with the real export surface from `packages/core/src/index.ts`.
- Keep template docs aligned with starter behavior and scripts in `template/package.json`.
- For internal `@lf/lf-form-*` dependency examples, always use `"*"` (the workspace link). Semver
  ranges would send npm to a registry where these packages do not exist.
- There is no release or publish process; `version` fields are informational only.
- Validate workspace changes with:
  - `npm run build:types`
  - `npm run build:core`
  - `npm run build:examples`
  - `npm run build:template`

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
