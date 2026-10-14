# Creating a Pull Request (PR)

All PRs target `dev`. Never open a PR against `main` — `main` only receives
the `dev` → `main` release promotion.

The PR form is auto-filled from `.github/PULL_REQUEST_TEMPLATE.md`. You just
fill in each section. This guide walks through it.

## Before you open a PR

```bash
# 1. Make sure your branch is based on fresh dev
git checkout dev
git pull origin dev
git checkout feature/short-description
git merge origin/dev

# 2. Validate locally (same checks CI runs)
npm run lint
npm run typecheck
npm run test --if-present
npm run build

# 3. Push your branch
git push origin feature/short-description
```

Then on GitHub: **Pull requests → New pull request → base: `dev` ←
compare: `feature/short-description`** → Create.

Double-check the base says `dev`. If it says `main`, change it.

## How to fill the template, section by section

### 1. What does this PR do?

Describe the change clearly: what problem it solves, what was added or fixed,
and why. One or two short paragraphs beat a single vague line.

```markdown
## What does this PR do?

Adds the student booking page (`/book`) with faculty availability lookup.
Students can request a consultation slot; faculty see the request as pending.
Needed for milestone 2 (booking flow).
```

Bad: `stuff`, `updates`, `fix bug`. The reviewer should understand the PR
without opening the diff.

### 2. Type of change

Check exactly one box (lowercase `x`):

```markdown
## Type of change

- [x] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — restructure without behavior change
- [ ] `chore` — deps, config, tooling
- [ ] `docs` — documentation only
- [ ] `test` — adding or updating tests
```

The type must match your branch prefix and your commit types.

### 3. Scope

Check all scopes the PR touches:

```markdown
## Scope

- [ ] `frontend`
- [ ] `backend`
- [ ] `mobile`
- [ ] `ci`
- [x] `docs`
- [ ] `deps`
```

### 4. How to test?

Give numbered steps a reviewer can actually follow — not `works on my machine`.

```markdown
## How to test?

1. `npm run dev`, log in as a student
2. Go to `/book`, pick a faculty member and an open slot
3. Submit — confirm a pending request appears
4. Log in as that faculty member — confirm the request shows in the queue
```

### 5. Checklist

Check every box honestly before requesting review. The key ones:

- [ ] Branched off `dev` — see [branching.md](./branching.md)
- [ ] Commits follow `type(scope): description` — see [commits.md](./commits.md)
- [ ] No `console.log` or debug code
- [ ] No hardcoded secrets
- [ ] Lint passes, tests pass
- [ ] Docs updated if endpoints or rules changed

If a box does not apply (e.g. no migration), leave it unchecked only if the
template allows — otherwise check it and write `N/A` reasoning in the PR body.

### 6. Closes

Link the issue so it auto-closes on merge:

```markdown
Closes #123
```

Use `Closes #123`, not `fixes`, not a bare URL, not just `#123` in prose.

## Worked example (filled PR body)

```markdown
## What does this PR do?

Adds `docs/contribution/` team guides for branching, commits, and PRs.
New members kept branching off `main` and targeting `main`, so this
documents the dev-based flow in one place.

---

## Type of change

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — restructure without behavior change
- [ ] `chore` — deps, config, tooling
- [x] `docs` — documentation only
- [ ] `test` — adding or updating tests

## Scope

- [ ] `frontend`
- [ ] `backend`
- [ ] `mobile`
- [ ] `ci`
- [x] `docs`
- [ ] `deps`

---

## How to test?

1. Read `docs/contribution/README.md`
2. Follow `branching.md` commands to create a test branch off `dev`
3. Confirm commit examples match `type(scope): description` format

---

## Checklist

- [x] Branched off `dev`
- [x] Commits follow `type(scope): description`
- [x] No `console.log` or debug code
- [x] No hardcoded secrets
- [x] Lint passes
- [x] Tests pass
- [x] Docs updated if endpoints or rules changed
- [x] Compatibility matrix passes if a profile, dependency, runtime, or container changed
- [x] Major upgrades include migration notes

Closes #45
```

## After opening

1. Request a reviewer. Respond to comments with new commits — don't force-push
   over review history unless asked.
2. Keep the PR small. If review drags past ~400 lines of diff, split the
   branch.
3. Merge only into `dev`. Delete your branch after merge.
4. `dev` → `main` is a separate release step done by the lead — never include
   it in a feature PR.

## Common mistakes

| Mistake                           | Fix                                                |
| --------------------------------- | -------------------------------------------------- |
| Base set to `main`                | Change base to `dev` before requesting review      |
| Empty "What does this PR do?"     | Write what + why in 2–3 sentences                  |
| "How to test?" left as `1. 2. 3.` | Write real numbered steps                          |
| Checklist left unchecked          | Run lint/tests, update docs, then check            |
| No `Closes #` link                | Add `Closes #<issue>` so the issue closes on merge |
| One PR with 5 unrelated changes   | Split into one branch + PR per change              |
