@AGENTS.md

## Dependency Management

This project is built on a machine that uses a private npm registry. **Never run `npm install`, `npm ci`, or any package manager install command.**

When adding a new library or dependency:
1. Add it directly to `package.json` (`dependencies` or `devDependencies`) with the appropriate version
2. That's it — do not run any install command

The developer runs installs manually in their environment.

## Git Identity

Commits must be attributed to the personal GitHub account. The local git config is already set:

```
user.name  = Miguel
user.email = 94724021+lmiguelcardoso@users.noreply.github.com
```

Never modify the global git config. Always use `--local` if any git config change is needed.
