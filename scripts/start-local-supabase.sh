#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
credentials_file="$project_root/supabase/.env.local"

if [[ ! -f "$credentials_file" ]]; then
  echo "Local Supabase OAuth credentials are not configured."
  echo "Copy supabase/.env.example to supabase/.env.local and add your Google credentials."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$credentials_file"
set +a

: "${GOOGLE_CLIENT_ID:?GOOGLE_CLIENT_ID is missing in supabase/.env.local}"
: "${GOOGLE_CLIENT_SECRET:?GOOGLE_CLIENT_SECRET is missing in supabase/.env.local}"

cd "$project_root"
exec supabase start
