# faculty-consultation-system

> designed for school system

Generated with create-win-project. This repository includes a runnable application, tests, CI guidance, and task-routed agent playbooks.

## Start

```bash
cp .env.example .env.local 2>/dev/null || cp .env.example .env
npm install
npm run dev
```

## Validate

```bash
npm run lint
npm run typecheck
npm run test --if-present
npm run build
```

Commit the generated lockfile before enabling CI; CI intentionally uses `npm ci`.

## Agent-assisted work

1. Put product goals and boundaries in `CONTEXT.md`.
2. Read `AGENTS.md` for commands and authority boundaries.
3. Use `RULES.md` to open only the relevant playbook section.
4. Treat tests and application behavior as the source of truth when prose drifts.

## Important files

- `AGENTS.md`: small always-on operating contract.
- `RULES.md`: concern-to-playbook router.
- `CONTEXT.md`: project-specific intent and decisions.
- `docs/`: architecture, API, setup, and deployment documentation.
