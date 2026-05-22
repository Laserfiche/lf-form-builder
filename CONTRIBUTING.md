# Contributing

This guide explains how to develop, test, and contribute to lf-form-builder.

## Getting Started

### Prerequisites

- Node.js 20+ (enforced in `package.json` engines)
- npm 10+ (for workspace support)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Laserfiche/lf-form-builder.git
cd lf-form-builder

# Install dependencies (installs all workspaces)
npm install

# Verify setup
npm run build     # Full build
npm run lint      # Linting
npm test          # Tests
npm run typecheck # Type checking
```

## Development Workflow

### Making Changes

1. **Choose a package to modify**:
   ```bash
   # Core library
   packages/core/src/

   # Shared types
   packages/types/src/

   # Examples
   packages/examples/src/

   # Starter template
   template/
   ```

2. **Follow the architecture** — See [ARCHITECTURE.md](ARCHITECTURE.md) for module organization

3. **Add tests** — New code must include tests:
   ```bash
   # Create test file in __tests__ mirroring src structure
   packages/core/__tests__/lib/myModule.test.ts

   # Run tests
   npm test

   # Run with coverage
   npm run test:coverage
   ```

### Testing

**Test requirements**:
- All public functions must have unit tests
- Use existing LFForm mock in `__tests__/mocks/lfForm.mock.ts`
- Coverage thresholds: 60% lines/functions/statements, 50% branches
- All tests must pass before pushing

**Run tests**:
```bash
# All tests
npm test

# Specific test file
npm test -- findFieldByLFFormId.test.ts

# Watch mode (local development)
npm run test:watch --workspace=packages/core

# Coverage report
npm run test:coverage
```

### Code Quality

**Type checking**:
```bash
# Full monorepo
npm run typecheck

# Specific package
npm run typecheck --workspace=packages/core
```

**Linting**:
```bash
# All files
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

**Build verification**:
```bash
# Full monorepo build
npm run build

# Build specific package
npm run build --workspace=packages/core

# Build examples (tests plugins)
npm run build:examples
```

## Commit Standards

- **Write clear commit messages**: `feat: add field validation` or `fix: handle null fields`
- **Reference issues**: `Fix #123` or `Closes #456`
- **Test first**: All commits must pass `npm test && npm run typecheck && npm run lint`
- **Keep commits atomic**: One logical change per commit

## Release Process

**Versions**:
- Bump version in both `packages/types/` and `packages/core/package.json`
- Update version refs in `packages/examples/` and `template/`
- Update CHANGELOG.md with changes

**Automated release script**:
```bash
# From repo root
./scripts/release.sh

# Prompts for semver bump (major/minor/patch)
# Aligns versions, creates commit + signed tag
# Push to GitHub to trigger CI publish workflow
```

## Project Structure Reference

```
packages/core/               # Main library
├── src/
│   ├── index.ts            # Public API exports
│   ├── lib/                # Core utilities
│   │   ├── api/            # API helpers
│   │   ├── fieldRules/     # Field rule builder
│   │   └── utils/          # Utility functions
│   ├── components/         # UI components
│   └── css/                # LESS stylesheets
├── __tests__/
│   ├── lib/                # Tests mirroring src/lib
│   └── mocks/              # Reusable mocks
├── vitest.config.ts        # Test config
└── vite.config.lib.ts      # Build config

packages/types/             # Shared types
├── src/types/              # TypeScript definitions
└── lib/                    # Built output

template/                   # Starter template
├── src/Forms/              # Example form structure
└── package.json            # Consumer-facing example

.github/workflows/          # CI/CD
├── ci.yml                  # Lint/test/typecheck on PRs
└── publish.yml             # Auto-publish on release
```

## Key Files to Know

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Module organization and build pipeline
- **[packages/core/README.md](packages/core/README.md)** — API documentation
- **[packages/core/src/index.ts](packages/core/src/index.ts)** — Public API surface
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** — Monorepo conventions
- **[scripts/release.sh](scripts/release.sh)** — Release automation

## Common Tasks

### Adding a New Utility Function

1. Create file in `packages/core/src/lib/`
2. Add to `packages/core/src/index.ts` exports
3. Create test in `packages/core/__tests__/lib/`
4. Run `npm test` to verify
5. Update `packages/core/README.md` with usage example

### Adding a New Component

1. Create file in `packages/core/src/components/`
2. Export from `packages/core/src/index.ts`
3. Create test in `packages/core/__tests__/lib/components/`
4. Add JSDoc comments for documentation
5. Run `npm test && npm run build:core`

### Updating Vite Plugin

1. Modify files in `packages/core/src/plugins/`
2. Update exports in `packages/core/src/plugins/index.ts`
3. Add/update integration tests
4. Verify example builds: `npm run build:examples`

### Adding a New Export Path

1. Add to `packages/core/package.json` exports map
2. Create corresponding source file(s)
3. Update [ARCHITECTURE.md](ARCHITECTURE.md)
4. Test via template: `import X from '@lf/lf-form-builder/path'`

## Troubleshooting

**Tests fail with "LFForm is not defined"**:
- Ensure test setup is correct: check `__tests__/setup.ts` runs before tests
- Verify vitest.config.ts has `setupFiles` pointing to setup.ts

**Build fails with "Cannot find module"**:
- Check path aliases in `tsconfig.json` and relative import paths
- Rebuild: `npm run build:core` (clean rebuild if needed)

**ESLint errors**:
- Run `npm run lint -- --fix` for auto-fixes
- Check `eslint.config.js` for rule configuration

**TypeScript errors**:
- Run `npm run typecheck` to see full errors
- Check tsconfig.json strict mode settings

## Questions?

See existing test files in `packages/core/__tests__/` for examples.
Check [packages/core/README.md](packages/core/README.md) for API details.
