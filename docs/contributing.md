# Contributing

Branch, commit, and pull request rules. Keep changes small and reviewable.

## Branch model

| Branch | Purpose                                   | Who writes to it                  |
| ------ | ----------------------------------------- | --------------------------------- |
| `main` | Production — always stable and deployable | Only via `dev` → `main` promotion |
| `dev`  | Integration — all work merges here first  | Only via merged PRs               |

Everything else is short-lived and deleted after merge.

```
main  (production)
 ▲
 │  promote: dev → main (release only)
 │
dev   (integration — all PRs target this)
 ▲ ▲ ▲
 │ │ └── fix/token-expiry-race
 │ └──── feature/student-booking-page
 └────── docs/update-setup-guide
```

## Branch rules

1. Never commit directly to `main` or `dev`.
2. Always branch off `dev`, never off `main`.
3. Always open PRs against `dev`, never `main`.
4. One logical change per branch.
5. Never push or open a PR with someone else's branch unless asked.

Naming: `<type>/<short-description>`, lowercase, hyphenated, 2–5 words, no issue number in the name.

| Prefix      | Use for                         |
| ----------- | ------------------------------- |
| `feature/`  | New capability                  |
| `fix/`      | Bug fix                         |
| `refactor/` | Restructure, no behavior change |
| `chore/`    | Deps, config, tooling           |
| `docs/`     | Documentation only              |
| `test/`     | Tests only                      |
| `ci/`       | CI changes                      |

```bash
git checkout dev
git pull origin dev
git checkout -b feature/short-description
```

If `dev` moved while you worked, `git merge origin/dev` into your branch before opening the PR. Prefer merge over rebase when unsure.

## Commit rules

Conventional Commits (light): `type(scope): short description`, lowercase, present tense, no trailing period, under 72 characters, one logical change per commit.

| Type       | When to use                         |
| ---------- | ----------------------------------- |
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `refactor` | Restructure without behavior change |
| `chore`    | Deps, config, tooling               |
| `docs`     | Documentation only                  |
| `test`     | Adding or updating tests            |
| `ci`       | CI/CD workflow changes              |
| `style`    | Formatting only                     |

Scopes say where the change lives: `app`, `api`, `db`, `auth`, `ci`, `docs`, `deps`. Avoid `misc`, `code`, `stuff`.

```bash
# Good
feat(app): add student booking page
fix(api): correct booking status transition
refactor(auth): move role check into helper
chore(deps): update supabase-js
docs(contribution): add branching guide

# Bad
Feat(App): Add Student Booking Page.   # uppercase + period
fix stuff                              # vague
feat(booking): added page              # past tense, feature-name scope
```

Stage only related files, prefer specific paths over `git add .`, and commit one layer plus one intent at a time. Amend only commits that have not been pushed.

## Pull requests

All PRs target `dev`; the form is auto-filled from `.github/PULL_REQUEST_TEMPLATE.md`. Match the type to your branch prefix and commit types, and fill in real test steps.

Before opening:

```bash
git checkout dev && git pull origin dev
git checkout feature/short-description
git merge origin/dev
npm run check
npm run build
npm run supabase:test
git push origin feature/short-description
```

Then on GitHub: **Pull requests → New pull request → base: `dev` ← compare: your branch**. Double-check the base says `dev`.

PR checklist:

- [ ] Branched off `dev`.
- [ ] Commits follow `type(scope): description`.
- [ ] No `console.log`, debug code, or hardcoded secrets.
- [ ] `npm run check` and `npm run build` pass.
- [ ] Docs updated if endpoints or rules changed.

Link the issue with `Closes #123` so it auto-closes on merge.

## After opening

1. Request a reviewer and respond with new commits — do not force-push over review history unless asked.
2. Keep the PR small; split it if the diff grows past ~400 lines.
3. Merge only into `dev`, then delete the branch.
4. `dev` → `main` is a separate release step done by the lead.
