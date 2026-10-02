# Contributing — Team Guidance

Short, practical rules for working together on `faculty-consultation-system`.

## Golden rules (read this first)

1. `main` is production — always stable, always deployable. Never commit to it directly.
2. `dev` is integration — all work merges here first. Never commit to it directly.
3. ALWAYS branch off `dev`, never off `main`.
4. ALWAYS open pull requests (PRs) targeting `dev`, never `main`.
5. Only `dev` → `main` promotes to production (release, done by maintainer/lead).
6. One branch = one logical change. Keep branches small and focused.
7. Commits follow `type(scope): short description`.

```
main  (production, stable)
 ▲
 │  promote only: dev → main (release)
 │
dev   (integration, all PRs target this)
 ▲ ▲ ▲
 │ │ └── fix/token-expiry-race
 │ └──── feature/student-booking-page
 └────── docs/update-setup-guide
```

## Guides in this folder

| Guide                                  | What it covers                                                 |
| -------------------------------------- | -------------------------------------------------------------- |
| [branching.md](./branching.md)         | Branch roles, naming, and the exact commands to start a branch |
| [commits.md](./commits.md)             | Commit message format, types, scopes, good/bad examples        |
| [pull-requests.md](./pull-requests.md) | How to open a PR and fill in the PR template step by step      |

## Quick start (daily loop)

```bash
# 1. Update dev
git checkout dev
git pull origin dev

# 2. Create your branch off dev
git checkout -b feature/short-description

# 3. Work in small commits
git add <file>
git commit -m "feat(app): add student booking page"

# 4. Push and open a PR to dev
git push origin feature/short-description
# GitHub → Open PR → base: dev ← compare: your branch
```

> The PR form is auto-filled from `.github/PULL_REQUEST_TEMPLATE.md`.
> See [pull-requests.md](./pull-requests.md) for how to fill each section.

## Source of truth

- Branch + commit conventions: `playbooks/universal/git-conventions.md`
- PR template file: `.github/PULL_REQUEST_TEMPLATE.md`
- If this folder and those files disagree, those files win.
