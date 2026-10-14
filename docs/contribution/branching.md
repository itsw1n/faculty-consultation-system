# Branching Rules

## The two permanent branches

| Branch | Purpose                                       | Who writes to it                            |
| ------ | --------------------------------------------- | ------------------------------------------- |
| `main` | Production — always stable, always deployable | Only via `dev` → `main` promotion (release) |
| `dev`  | Integration — all features merge here first   | Only via merged PRs, never direct commits   |

There are no other long-lived branches. Everything else is short-lived and deleted after merge.

## Hard rules

- NEVER commit directly to `main` or `dev`.
- ALWAYS branch off `dev` — never off `main`. Branching off `main` bypasses
  unreleased work in `dev` and guarantees merge conflicts later.
- ALWAYS target PRs at `dev`, never at `main`.
- One logical change per branch. If you need two PRs, make two branches.
- NEVER push to remote or open a PR with someone else's branch unless asked.

## Branch naming

Format: `<type>/<short-description>`

| Prefix      | Use for                         | Example                          |
| ----------- | ------------------------------- | -------------------------------- |
| `feature/`  | New capability                  | `feature/student-booking-page`   |
| `fix/`      | Bug fix                         | `fix/token-expiry-race`          |
| `refactor/` | Restructure, no behavior change | `refactor/auth-feature-module`   |
| `chore/`    | Deps, config, tooling           | `chore/update-dependencies`      |
| `docs/`     | Documentation only              | `docs/update-api-endpoints`      |
| `test/`     | Adding or updating tests only   | `test/add-booking-service-tests` |
| `ci/`       | GitHub Actions / CI changes     | `ci/add-e2e-workflow`            |

Rules for the description part:

- Lowercase, words separated by `-` (no spaces, no underscores).
- Short (2–5 words). `feature/add-student-booking-calendar` not
  `feature/implement-the-new-student-booking-calendar-page-for-sprint-3`.
- No issue number in the name — link the issue in the PR with `Closes #123` instead.

## Starting a branch (copy-paste)

```bash
# 1. Move to dev and update it
git checkout dev
git pull origin dev

# 2. Create your branch off dev
git checkout -b feature/short-description
```

Real examples:

```bash
git checkout -b feature/faculty-availability-page
git checkout -b fix/booking-status-transition
git checkout -b docs/contribution-guide
```

## Keeping your branch fresh

If `dev` moved while you worked, rebase or merge `dev` back in before opening
your PR so conflicts surface early:

```bash
# On your feature branch:
git fetch origin
git merge origin/dev
# resolve conflicts, test, then push
git push origin feature/short-description
```

Prefer `merge` over `rebase` if you are unsure — it is safer for shared branches.

## How branches flow

```
                    ┌──────────────────┐
                    │  feature/*, fix/* │  short-lived, off dev
                    └────────┬─────────┘
                             │ PR → dev
                             ▼
                    ┌──────────────────┐
                    │       dev        │  integration
                    └────────┬─────────┘
                             │ promote → main (release only)
                             ▼
                    ┌──────────────────┐
                    │       main       │  production
                    └──────────────────┘
```

## Common mistakes

| Mistake                         | Why it hurts                                   | Do this instead                         |
| ------------------------------- | ---------------------------------------------- | --------------------------------------- |
| Branching off `main`            | Misses unreleased `dev` work, causes conflicts | `git checkout dev` first, then branch   |
| Opening PR to `main`            | Skips integration testing in `dev`             | Set PR base to `dev`                    |
| Committing straight to `dev`    | Breaks integration for everyone                | Make a `feature/*` branch               |
| One giant branch for everything | Unreviewable, blocks the team                  | One branch per logical change           |
| Reusing an old merged branch    | Drags in stale history                         | Delete after merge, make a fresh branch |
