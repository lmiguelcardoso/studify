@AGENTS.md

## Dependency Management

This project is built on a machine that uses a private npm registry. **Never run `npm install`, `npm ci`, or any package manager install command.**

When adding a new library or dependency:
1. Add it directly to `package.json` (`dependencies` or `devDependencies`) with the appropriate version
2. That's it — do not run any install command

The developer runs installs manually in their environment.
