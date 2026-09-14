# CampusConnect

A faculty consultation and scheduling system for students, faculty, and school administrators. It uses Next.js 16, Supabase Auth/PostgreSQL, TypeScript, React Aria, and Tailwind CSS.

## Local development

```bash
cp .env.example .env.local
npm install
npm run supabase:start
npm run supabase:reset
npm run dev
```

Configure Google OAuth in Supabase to exercise the full account flow. Local seed data and database tests live under `supabase/`.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run supabase:test
npm run test:e2e
```

See [CONTEXT.md](CONTEXT.md), [the product specifications](docs/specs/product-requirements.md), and [the implementation plan](docs/plans/implementation-plan.md) for system behavior and status.

## Releases

After frontend, database, dependency, secret, and audit checks succeed for a change on `main`, the release workflow analyzes Conventional Commits, selects the next semantic version, tags the exact validated commit, and publishes generated GitHub release notes. `feat` commits produce minor releases, `fix` commits produce patch releases, and breaking changes produce major releases. The first automated release is `v1.0.0`.
