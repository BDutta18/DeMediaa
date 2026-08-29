# Contributing to DeMedia

Thank you for your interest in contributing to **DeMedia**! We welcome bug reports, feature suggestions, and pull requests.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Commit Conventions](#commit-conventions)
- [Branch Naming](#branch-naming)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Style](#code-style)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Follow the [Local Development](README.md#local-development) guide to set up the project.
3. Create a new branch for your change (see [Branch Naming](#branch-naming)).
4. Make your changes, ensure tests pass, then open a pull request.

---

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

`
<type>(<scope>): <short description>

[optional body]

[optional footer]
`

### Types

| Type | When to use |
| :--- | :--- |
| eat | A new feature |
| ix | A bug fix |
| docs | Documentation only changes |
| style | Formatting, no logic change |
| efactor | Code restructuring, no feature/fix |
| 	est | Adding or updating tests |
| chore | Build tooling, CI, dependency updates |
| perf | Performance improvement |

### Examples

`
feat(frontend): add copy-to-clipboard for wallet address
fix(backend): return 400 on missing tokenId in marketplace routes
docs: update README with deployment guide
chore: bump @stellar/stellar-sdk to v15
`

---

## Branch Naming

`
feat/<short-description>       # new feature
fix/<short-description>        # bug fix
docs/<short-description>       # documentation
chore/<short-description>      # tooling / CI
`

---

## Pull Request Guidelines

- Keep PRs **small and focused** — one concern per PR.
- Fill in the PR template completely.
- Link to the related issue if one exists.
- Ensure **CI passes** (lint, type-check, build, tests) before requesting review.
- Request review from at least one maintainer.

---

## Code Style

- **TypeScript** for all frontend and backend code.
- Frontend follows **Next.js App Router** conventions.
- Backend follows **Express** modular structure (routes ? controllers ? services ? models).
- Run 
pm run lint and 
pm run typecheck before pushing.
- Prettier formatting is enforced via CI (
pm run format:check).

---

## Reporting Issues

Please use [GitHub Issues](https://github.com/BDutta18/DeMedia/issues) and include:

- A clear description of the bug or feature request.
- Steps to reproduce (for bugs).
- Expected vs actual behaviour.
- Screenshots or logs if relevant.
