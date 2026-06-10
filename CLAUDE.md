@AGENTS.md

## Dependency Management

This project is built on a machine that uses a private npm registry. **Never run `npm install`, `npm ci`, or any package manager install command.**

When adding a new library or dependency:
1. Add it directly to `package.json` (`dependencies` or `devDependencies`) with the appropriate version
2. That's it — do not run any install command

The developer runs installs manually in their environment.

## Git Identity

Commits must be attributed to the personal GitHub account (`lmiguelcardoso`). The local git config is already set — never modify the global git config.

## Branching Workflow

- `main` — production only. Never commit directly to it.
- `develop` — integration branch. All features land here via pull request.
- Feature branches — named `feature/<issue-number>-short-description`, always branched from `develop`.

**Flow for every feature:**
1. `git checkout develop && git pull origin develop`
2. `git checkout -b feature/<issue-number>-short-description`
3. Commit work on the feature branch
4. Open a PR targeting `develop` (never `main`)
5. Merge the PR — `develop` is updated
6. `main` is updated only for production releases (merge from `develop`)
