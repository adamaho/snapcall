# @monorepo/tool-tsconfig

Shared TypeScript configurations for this Turborepo.

## Exports

- `@monorepo/tool-tsconfig/base`: strict baseline compiler defaults.
- `@monorepo/tool-tsconfig/service`: NodeNext defaults and Effect diagnostics for services.
- `@monorepo/tool-tsconfig/app-vite`: bundler and React defaults for Vite workspaces.

The presets extend `@adamaho/nopeus-tsconfig` from the workspace catalog.
The Effect preset disables `unstableApiUsage` diagnostics so services can
intentionally use Effect's unstable APIs. Installing dependencies patches the
TypeScript compiler with the catalog's `@effect/tsgo` version via this package's
`prepare` script.

## Usage in a workspace package

1. Add this package to the workspace's `devDependencies`:

```json
{
  "imports": {
    "#src/*": "./src/*"
  },
  "devDependencies": {
    "@monorepo/tool-tsconfig": "workspace:*"
  }
}
```

Both `service` and `app-vite` resolve package-local aliases from `package.json`.
Use imports such as `#src/billing/calculate-total.ts` with explicit TypeScript
extensions. Add `#test/*` only when a `test` folder exists. See the
[package import conventions](../../CONTRIBUTING.md#package-imports) for tests,
workspace boundaries, and build output requirements.

2. Extend the workspace `tsconfig.json`:

```json
{
  "extends": "@monorepo/tool-tsconfig/service",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"]
}
```
