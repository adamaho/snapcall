# Changesets

Changesets describe user-facing package changes and drive package versioning.

Run `pnpm changeset` when a pull request changes a publishable package. Select the affected packages, choose the appropriate semantic version bump, and commit the generated Markdown file with the pull request.

Changesets are not required for documentation, infrastructure, application-only, or private-package changes.

Run `pnpm changeset:status` to inspect pending releases. Release automation is intentionally not configured by this template; repositories that publish packages should add a release workflow for their chosen registry.
