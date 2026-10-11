# Commit Rules

We follow Conventional Commits (light version). Every commit message has the form:

```
type(scope): short description
```

The space after the colon is required.

## Rules

- Lowercase only — no uppercase anywhere (`feat`, not `Feat`).
- No period at the end.
- Present tense — `add`, not `added`; `fix`, not `fixed`.
- Under 72 characters for the whole message.
- One logical change per commit. Split unrelated changes into separate commits.
- Never use vague messages: `fix stuff`, `update code`, `wip`, `asdf`.

## Types

| Type | When to use |
| ---- | ----------- |
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Restructure without behavior change |
| `chore` | Deps, config, tooling — no production code change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `ci` | GitHub Actions or CI/CD workflow changes |
| `style` | Formatting, whitespace — no logic change |

## Scopes (Next.js projects)

The scope says *where* the change lives, not what the feature is called.

| Scope | When to use |
| ----- | ----------- |
| `app` | App Router, pages, layouts, UI components |
| `api` | API routes or server actions |
| `db` | Database schema, migrations, seeds |
| `auth` | Authentication / authorization logic |
| `ci` | GitHub Actions workflows |
| `docs` | Anything inside `docs/` |
| `deps` | Dependency updates |

Avoid generic scopes like `misc`, `code`, or `stuff`.

## Good vs bad

```bash
# Good
feat(app): add student booking page
fix(api): correct booking status transition
refactor(auth): move role check into helper
chore(deps): update supabase-js to 2.45.0
docs(contribution): add branching guide
test(api): add tests for booking service
ci(e2e): add playwright workflow

# Bad — do not do these
Feat(App): Add Student Booking Page.   # uppercase + period
fix stuff                              # vague, no type/scope
feat(booking): added page              # past tense, scope is feature name
update code                            # no convention at all
feat(app): add student booking page and fix login race and update deps
                                       # three changes in one commit — split it
```

## How to commit (copy-paste)

```bash
# 1. Check what changed
git status
git diff

# 2. Stage only related files (prefer specific files over `git add .`)
git add src/app/book/page.tsx
git add src/app/book/actions.ts

# 3. Commit one logical change
git commit -m "feat(app): add student booking page"

# 4. Repeat for the next logical change
git add supabase/migrations/0005_add_booking_status.sql
git commit -m "feat(db): add booking status column"
```

One commit = one layer + one intent. A commit may touch several files only if
all of them serve the same change (e.g. a page plus its server action).

## Amending (before push only)

```bash
# Fix the last commit message
git commit --amend -m "feat(app): add student booking page"

# Add a forgotten file to the last commit (only if not pushed yet)
git add forgotten-file.ts
git commit --amend --no-edit
```

Never amend commits that are already pushed and under review — make a new
commit instead so reviewers can follow the history.
