# Faculty Consultation and Scheduling System

Web app for Assumption College of Davao: students request consultations, faculty manage availability and requests, admins manage accounts. Next.js 16 · Supabase Auth + PostgreSQL · TypeScript · React Aria · Tailwind CSS.

## Start here

| I want to…                          | Go to                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Run it locally                      | [`docs/guides/setup.md`](docs/guides/setup.md)                                                                                                                                      |
| Configure env (local vs prod)       | [`docs/guides/env-variables.md`](docs/guides/env-variables.md)                                                                                                                      |
| Deploy it                           | [`docs/guides/deployment.md`](docs/guides/deployment.md)                                                                                                                            |
| Understand the system               | [`docs/architecture/overview.md`](docs/architecture/overview.md)                                                                                                                    |
| Know what it must do                | [`docs/specs/`](docs/specs/) (source of truth)                                                                                                                                      |
| Check what is built / left          | [`docs/plans/implementation-plan.md`](docs/plans/implementation-plan.md) + [`docs/plans/ACD_Implementation_Gap_Tracker_v0.2.md`](docs/plans/ACD_Implementation_Gap_Tracker_v0.2.md) |
| Contribute (branches, commits, PRs) | [`docs/contribution/`](docs/contribution/)                                                                                                                                          |

## Run locally

```bash
cp .env.example .env.local
npm install
npm run supabase:start
npm run supabase:reset
npm run dev
```

Full steps (Google OAuth, seed data, school-domain behavior): [`docs/guides/setup.md`](docs/guides/setup.md).

## Work on it

- Branch off `dev`, never `main`. Open PRs against `dev`: [`docs/contribution/branching.md`](docs/contribution/branching.md), [`docs/contribution/pull-requests.md`](docs/contribution/pull-requests.md).
- Commits follow `type(scope): description`: [`docs/contribution/commits.md`](docs/contribution/commits.md).

## Validate

```bash
npm run check    # format + lint + typecheck + tests
npm run build
npm run supabase:test
npm run test:e2e
```

## Releases

Merging `dev` → `main` runs full CI; on green, the release workflow tags the next semantic version from Conventional Commits (`feat` → minor, `fix` → patch) and publishes generated notes. Production database pushes and hosting deploys are separate, explicitly approved steps.
