# Toolchain Requirements

Install only the tools required by the local workflow. ESLint, Prettier, TypeScript, Vitest, Playwright, and framework CLIs are project dependencies; run them through npm scripts or `npx`, never as global installations.

| Tool                | Version                   | When needed                                    | Version source                          |
| ------------------- | ------------------------- | ---------------------------------------------- | --------------------------------------- |
| Node.js             | 22.14.0+ (tested 24.20.0) | JavaScript application                         | `.node-version`, `package.json`         |
| npm                 | 11.19.0+                  | Local package scripts                          | `package.json#packageManager`, `.npmrc` |
| Docker              | Current supported release | Local Supabase containers                      | `docker-compose.yml` is app-only        |
| Supabase CLI        | Pinned by `supabase`      | Local database, migrations, and database tests | `package.json`                          |
| Playwright Chromium | Installed by Playwright   | End-to-end tests                               | `npm run test:e2e`                      |

- `npm run supabase:start` starts the Supabase stack.
- `npm run supabase:test` runs the database tests.
- `npm run check` runs format, lint, typecheck, and unit tests.
- `npm run build` runs the production build.

## Host ports

Before starting local services, check whether the default ports are already in use (for example, `ss -ltn` on Linux). The optional Compose workflow exposes the app on port 3000 by default; override it with `FRONTEND_HOST_PORT`. Supabase runs separately through the Supabase CLI.
