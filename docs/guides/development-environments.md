# Development Environments

## Default local workflow

Use the commands in `setup.md` to run the app and the Supabase stack on the host. Docker is optional.

## Optional Docker workflow

Docker Engine 27 or newer with Docker Compose v2.30 or newer is recommended. Allocate at least 4 GB of memory and 10 GB of free disk space for images, caches, and databases. Check occupied ports before startup with `ss -ltn` (Linux) or your platform's equivalent.

```bash
docker compose config
docker compose build
docker compose up -d
```

Override the host port collision with `FRONTEND_HOST_PORT`. Supabase runs separately through the Supabase CLI, so the compose file only builds the Next.js app.

## Dev Containers

A generic Dev Container is intentionally not generated: JavaScript, Java, PHP, and mobile stacks need different host/device boundaries. VS Code and Codespaces users can open the repository normally and add a stack-specific Dev Container later without changing the supported local or Compose workflows.
