# Contributing

This repository is a template monorepo. Keep changes small, explicit, and easy
to carry forward into future projects created from the template.

## Prerequisites

Install these before working in the repo:

- [Node.js](https://nodejs.org/en/download) 24, matching `engines.node` in `package.json`
- [pnpm](https://pnpm.io/installation) at the version pinned in `packageManager`
- [Docker with Compose](https://docs.docker.com/get-docker/) when using local services

## Development Setup

Use the Node.js and pnpm versions declared in `package.json`. Existing tools
in a local machine or sandbox are fine when they meet those requirements.
Install pnpm directly using its [installation instructions](https://pnpm.io/installation);
use the pinned version and do not use Corepack.

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Start local infrastructure when a package needs shared runtime services:

```bash
pnpm --filter=@monorepo/infra-local run infra:up
```

## Verification

Run the full local verification command before opening a PR or committing a
completed change:

```bash
pnpm check
```

This runs the repository format check, then the root Oxlint configuration,
then package-level TypeScript tasks through Turbo where packages define them.

Useful focused commands:

- `pnpm fmt` formats the repository
- `pnpm fmt:check` checks formatting without writing changes
- `pnpm lint` checks the repository with the root Oxlint configuration
- `pnpm turbo run test:unit` runs package unit test tasks through Turbo
- `pnpm tsc` runs package TypeScript tasks through Turbo

## Workspace Layout

Use the existing top-level workspace directories consistently:

- `programs/*` for deployable applications, APIs, workers, and other executables
- `packages/*` for shared features, reusable libraries, and external service clients
- `tools/*` for internal tooling packages
- `infra/*` for local and shared infrastructure helpers

Programs are deployable entry points and should stay thin.
Keep code used by only one deployable local to it, such as under
`programs/web/src/features/*`. Move a feature or capability into `packages/*`
when it becomes shared or needs an explicit public API and dependency boundary.

Do not apply category-based prefixes or suffixes to packages under `packages/*`.
The directory name must match the package's `package.json` name, excluding the
npm scope when present. For example, `packages/billing/package.json` uses the
name `@monorepo/billing`.

## Package Imports

Use native Node.js `package.json` imports for package-local modules in every
workspace package with source or test folders. Add only the mappings whose
folders exist:

```json
{
  "imports": {
    "#src/*": "./src/*",
    "#test/*": "./test/*"
  }
}
```

Keep explicit `.ts` extensions in TypeScript imports, including nested paths:

```ts
import { calculateTotal } from "#src/billing/calculate-total.ts";
import { receiptFixture } from "#test/fixtures/receipt.ts";
```

Replace parent-directory imports such as `../` and `../../` with these aliases.
Same-directory `./` imports may remain. The root lint config enforces this
convention with `import/no-relative-parent-imports` using the pinned Nopeus
version. Keep inter-package imports on workspace package names and their public
`exports`; aliases are private to the package declaring them. Do not introduce
TypeScript-only `paths` mappings or duplicate aliases in test/bundler config.

Use the shared `service` (NodeNext) or `app-vite` (bundler) TypeScript preset,
which enables `resolvePackageJsonImports`. Include `test/**/*.ts` and set
`rootDir` to `.` when type-checking tests alongside source. Node.js 24 runs
source `.ts` entry points directly; Vitest and Vite resolve the same imports
from the package manifest.

The mappings above target source files. For bundled builds, ensure the bundler
resolves local aliases into the bundle. For unbundled JavaScript output, define
an output-specific imports map in the deployed package manifest and verify it
with Node.js. TypeScript's `rewriteRelativeImportExtensions` does not rewrite
`#src/*.ts` specifiers; changing `outDir` alone does not make them target emitted
JavaScript.

## Formatting

The root `oxfmt.config.ts` imports `@adamaho/nopeus-oxfmt-config`. Keep shared
formatting defaults in that package and add project-specific overrides in the
root config. Workspace packages discover the root config automatically.

## Dependency Management

Prefer centralizing shared dependency versions in `pnpm-workspace.yaml` using
the catalog. This keeps package manifests small and makes upgrades easier to
review.

The catalog uses Effect 4 and a matching `@effect/vitest` release with Vitest 5.
Keep their peer requirements aligned when upgrading, and update `@effect/tsgo`
alongside them. The shared TypeScript tooling runs `effect-tsgo patch` during
installation.

Keep the strict 24-hour minimum release age enabled, including for Effect
packages. All packages under the `@adamaho` scope are excluded.

The root Oxlint configuration inherits the Nopeus Effect preset. Spacing around
Schema declarations, service methods, and Layer construction is enforced by
`nopeus/require-effect-construction-spacing`. When copying older configuration,
replace `nopeus/require-schema-group-spacing` and
`nopeus/require-service-method-spacing` overrides with this single rule.

## Changesets

Add a changeset when a pull request changes the public behavior of a publishable
package:

```bash
pnpm changeset
```

Select every affected package, choose the appropriate semantic version bump,
and commit the generated `.changeset/*.md` file with the change.

A changeset is not required for documentation, infrastructure,
application-only, or private-package changes. Run `pnpm changeset:status` to
inspect pending releases.

## Documentation Comments

Use JSDoc when it helps consumers understand an exported API. Use comments for
non-obvious behavior, invariants, side effects, failure semantics, lifecycle
requirements, intent, and tradeoffs.

Private helpers with clear names and TypeScript types do not require JSDoc. Do
not add `@param` or `@returns` tags when they merely repeat names and types
already expressed by TypeScript. Tests, fixtures, and straightforward
transformations generally do not need JSDoc.

Comments should explain why, not restate what the code does.

## Commit Messages

Prefer using the configured coding agent commit workflow when creating commits.
The agent formats the repo, stages the intended changes, writes a compliant
commit message, and pushes to the current branch.

Commit subjects must use scoped Conventional Commit format:

```text
<type>(<scope>): <description>
```

Allowed types:

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`

Use the affected package name without the npm scope as the commit scope. For
root-only template changes, use `monorepo`.

Examples:

```text
chore(monorepo): add contributor documentation
feat(web): add account settings page
fix(api): validate missing request body
```

## Coding Agents

Start coding agents from the repository root with Node.js and pnpm on `PATH`.
Use the same setup and verification commands as local development:

```bash
pnpm check
```
