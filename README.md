# Faculty Consultation and Scheduling System

Web app for Assumption College of Davao: students request consultations, faculty manage availability and requests, admins manage accounts. Next.js 16 · Supabase Auth + PostgreSQL · TypeScript · React Aria · Tailwind CSS.

## Start here

| I want to…                          | Go to                                                            |
| ----------------------------------- | ---------------------------------------------------------------- |
| Run it locally                      | [`docs/getting-started.md`](docs/getting-started.md)             |
| Understand the system               | [`docs/concepts/product.md`](docs/concepts/product.md)           |
| Look up routes or actions           | [`docs/reference/api.md`](docs/reference/api.md)                 |
| Configure env (local vs prod)       | [`docs/reference/environment.md`](docs/reference/environment.md) |
| Know the exact rules                | [`docs/concepts/rules.md`](docs/concepts/rules.md)               |
| Deploy it                           | [`docs/operations.md`](docs/operations.md)                       |
| Check what is built / left          | [`PROGRESS.md`](PROGRESS.md)                                     |
| Contribute (branches, commits, PRs) | [`docs/contributing.md`](docs/contributing.md)                   |

Full documentation map: [`docs/README.md`](docs/README.md).

## Run locally

```bash
cp .env.example .env.local
npm install
npm run supabase:start
npm run supabase:reset
npm run dev
```

Full steps (Google OAuth, seed data, first-admin claim, faculty invites): [`docs/getting-started.md`](docs/getting-started.md).

## Work on it

- Branch off `dev`, never `main`, and open PRs against `dev`: [`docs/contributing.md`](docs/contributing.md).
- Commits follow `type(scope): description`: [`docs/contributing.md`](docs/contributing.md#commit-rules).

## Validate

```bash
npm run check    # format + lint + typecheck + tests
npm run build
npm run supabase:test
npm run test:e2e
```

## Documentation map

- Index and reading paths: [`docs/README.md`](docs/README.md)
- Product intent: [`CONTEXT.md`](CONTEXT.md)
- Concepts (product, rules, architecture, data model): [`docs/concepts/`](docs/concepts/)
- Reference (API, environment, design): [`docs/reference/`](docs/reference/)
- Setup: [`docs/getting-started.md`](docs/getting-started.md)
- Operations: [`docs/operations.md`](docs/operations.md)
- Contributing: [`docs/contributing.md`](docs/contributing.md)
- Completion status: [`PROGRESS.md`](PROGRESS.md)

## Releases

Merging `dev` → `main` runs full CI; on green, the release workflow tags the next semantic version from Conventional Commits (`feat` → minor, `fix` → patch) and publishes generated notes. Production database pushes and hosting deploys are separate, explicitly approved steps.
