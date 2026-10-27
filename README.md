# monorepo

`monorepo` is a template repository for starting future projects with a shared
development environment and project structure.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow,
verification commands, workspace conventions, and commit guidelines.

## Prerequisites

Before developing in this repository, install:

- [Node.js](https://nodejs.org/en/download) 24, matching `engines.node` in `package.json`
- [pnpm](https://pnpm.io/installation) at the version pinned in `packageManager`
- [Docker with Compose](https://docs.docker.com/get-docker/) when using local services

## Usage

Use this prompt with your coding agent to configure the template for a new
project:

```text
Configure this repository for a new project. Rename the project from `monorepo`
to the new project name, update package names, documentation, configuration
files, and references across the repo. Preserve the existing pnpm workspace
and optional Docker services unless a change is required for the new project.
```

## Development

Follow the [development setup](./CONTRIBUTING.md#development-setup) to install
the required tools, then run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm check
```

Coding agents use these same commands with Node.js and pnpm on `PATH`.
