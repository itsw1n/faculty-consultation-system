# Development Environments

## Default local workflow

Use the commands in `setup.md` to run the app and the Supabase stack on the host. This is the supported workflow for OAuth, migrations, and end-to-end tests.

## Optional Docker workflow

Docker Engine 27 or newer with Docker Compose v2.30 or newer is recommended. Allocate at least 4 GB of memory and 10 GB of free disk space for images, caches, and databases. Check occupied ports before startup with `ss -ltn` (Linux) or your platform's equivalent.

```bash
docker compose config
docker compose build
docker compose up -d
```

Compose builds only the Next.js app with `Dockerfile.dev`. Supabase still runs through the Supabase CLI, so start it separately with `npm run supabase:start`. Override a host-port collision with `FRONTEND_HOST_PORT`.

The production `Dockerfile` uses the standalone Next.js output. It is not needed for local development.
