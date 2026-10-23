# AGENTS.md

> Small operating contract for agents. Project intent lives in `CONTEXT.md`; current behavior lives in `docs/`.

## Project

faculty-consultation-system — consultation and scheduling system for Assumption College of Davao.

- Stack: `nextjs-supabase`
- Platform: `web`
- Architecture profile: `MEDIUM`

## Commands

- Install: `npm install` initially; use `npm ci` after committing the lockfile.
- Develop: `npm run dev`
- Validate: `npm run check && npm run build`
- End-to-end: `npm run test:e2e --if-present`
- Database tests: `npm run supabase:test`

## Required workflow

1. Read `CONTEXT.md` and inspect neighboring implementation and tests.
2. Read only the doc that matches the task:
   - Docs index and reading paths: `docs/README.md`
   - Product intent: `CONTEXT.md`
   - What and why: `docs/concepts/product.md`
   - Exact rules: `docs/concepts/rules.md`
   - Runtime boundaries and flow: `docs/concepts/architecture.md`
   - Schema, RLS, RPCs: `docs/concepts/data-model.md`
   - Routes, actions, errors: `docs/reference/api.md`
   - Environment variables: `docs/reference/environment.md`
   - Design tokens: `docs/reference/design.md`
   - Local setup: `docs/getting-started.md`
   - Deploy and email: `docs/operations.md`
   - Branch, commit, PR rules: `docs/contributing.md`
   - Completion status: `PROGRESS.md`
3. State assumptions when product behavior is ambiguous.
4. Make the smallest coherent change and add risk-appropriate tests.
5. Run lint, typecheck, relevant tests, and a production build before completion.

## Engineering invariants

- Server Components by default; add `'use client'` only for browser behavior.
- Flow is route or action entry point → feature service/repository → Supabase/RPC.
- Feature code lives under `src/features/<domain>/`; shared UI lives under `src/components/layout` or `src/components/common`.
- Validate untrusted input with Zod at the server boundary.
- Authenticate and authorize separately; use `requireRole` or `requireApprovedProfile` before reads and mutations.
- PostgreSQL constraints, RPCs, and RLS are the final authority for booking and lifecycle state.
- Treat browser code and browser-visible environment variables as public.
- Never expose server-only values through `NEXT_PUBLIC_*` or client modules.
- Preserve semantic HTML, keyboard access, focus management, and progressive failure behavior.
- Add risk-appropriate unit, database, or Playwright coverage.

## Authority boundaries

- Do not deploy, publish, merge, push, send messages, or modify production data unless explicitly asked.
- Do not delete user work or weaken tests/security controls to make a check pass.

## Definition of done

- Acceptance behavior works and has appropriate coverage.
- Validation commands pass, or the exact blocker is reported.
- Errors do not leak secrets, personal data, or internal details.
- Relevant architecture, API, and environment documentation is updated.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
