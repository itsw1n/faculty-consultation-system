#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config_file="$project_root/supabase/config.toml"
runtime_dir="$(mktemp -d)"
config_backup="$runtime_dir/config.toml"
api_log="$runtime_dir/supabase-tunnel.log"
app_log="$runtime_dir/app-tunnel.log"
supabase_log="$runtime_dir/supabase.log"
lock_file="${TMPDIR:-/tmp}/faculty-consultation-system-demo.lock"

api_tunnel_pid=""
app_tunnel_pid=""
app_pid=""
auth_config_applied=false

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

stop_process() {
  local pid="$1"

  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
}

cleanup() {
  local exit_code=$?

  trap - EXIT INT TERM
  stop_process "$app_pid"
  stop_process "$app_tunnel_pid"
  stop_process "$api_tunnel_pid"

  if [[ -f "$config_backup" ]]; then
    cp "$config_backup" "$config_file"
  fi

  if [[ "$auth_config_applied" == true ]]; then
    printf '\nRestoring local Supabase Auth URLs...\n'
    npm --prefix "$project_root" run supabase:stop >/dev/null 2>&1 || true
    npm --prefix "$project_root" run supabase:start >/dev/null 2>&1 || true
  fi

  rm -rf "$runtime_dir"
  printf 'Demo stopped. Local configuration restored.\n'
  exit "$exit_code"
}

wait_for_tunnel_url() {
  local log_file="$1"
  local tunnel_pid="$2"
  local label="$3"
  local attempt
  local url

  for attempt in $(seq 1 60); do
    url="$(rg -o 'https://[a-z0-9-]+\.trycloudflare\.com' "$log_file" 2>/dev/null | head -n 1 || true)"
    if [[ -n "$url" ]]; then
      printf '%s' "$url"
      return 0
    fi

    if ! kill -0 "$tunnel_pid" 2>/dev/null; then
      printf '%s tunnel stopped before producing a URL. See %s\n' "$label" "$log_file" >&2
      return 1
    fi

    sleep 1
  done

  printf 'Timed out waiting for the %s tunnel. See %s\n' "$label" "$log_file" >&2
  return 1
}

trap cleanup EXIT
trap 'exit 0' INT TERM

require_command cloudflared
require_command curl
require_command docker
require_command flock
require_command node
require_command npm
require_command rg

cd "$project_root"
cp "$config_file" "$config_backup"

exec 9>"$lock_file"
if ! flock -n 9; then
  printf 'Another make demo command is already running. Stop it with Ctrl+C before starting a new one.\n' >&2
  exit 1
fi

if curl -fsS http://127.0.0.1:54321/auth/v1/health >/dev/null 2>&1; then
  printf 'Using the running local Supabase stack...\n'
else
  printf 'Starting local Supabase...\n'
  if ! npm run supabase:start >"$supabase_log" 2>&1; then
    cat "$supabase_log" >&2
    exit 1
  fi
fi

cloudflared tunnel --url http://127.0.0.1:54321 --no-autoupdate >"$api_log" 2>&1 &
api_tunnel_pid=$!
supabase_url="$(wait_for_tunnel_url "$api_log" "$api_tunnel_pid" 'Supabase')"

cloudflared tunnel --url http://127.0.0.1:3000 --no-autoupdate >"$app_log" 2>&1 &
app_tunnel_pid=$!
site_url="$(wait_for_tunnel_url "$app_log" "$app_tunnel_pid" 'application')"

node --input-type=module - "$config_file" "$site_url" <<'NODE'
import fs from "node:fs";

const [, , configPath, siteUrl] = process.argv;
let config = fs.readFileSync(configPath, "utf8");
config = config.replace(/^site_url = .*$/m, `site_url = "${siteUrl}"`);
config = config.replace(
  "additional_redirect_urls = [\n",
  `additional_redirect_urls = [\n  "${siteUrl}/auth/confirm",\n`,
);
fs.writeFileSync(configPath, config);
NODE

printf 'Applying the public callback URL to local Auth...\n'
auth_config_applied=true
if ! npm run supabase:stop >"$supabase_log" 2>&1 ||
  ! npm run supabase:start >>"$supabase_log" 2>&1; then
  cat "$supabase_log" >&2
  exit 1
fi

printf '\nDemo is ready\n'
printf 'Share this link: %s\n' "$site_url"
printf 'Mailpit (this computer only): http://127.0.0.1:54324\n'
printf 'Press Ctrl+C to stop the demo and restore local settings.\n\n'

NEXT_PUBLIC_SUPABASE_URL="$supabase_url" \
NEXT_PUBLIC_SITE_URL="$site_url" \
npm run dev &
app_pid=$!
wait "$app_pid"
