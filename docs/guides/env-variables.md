# Environment Variables

Copy the generated example before starting. Client environment location: `.env.local`.

| Variable                               | Visibility    | Required | Purpose                                                               |
| -------------------------------------- | ------------- | -------: | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | client/public |      yes | Supabase project URL.                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client/public |      yes | Public Supabase key; RLS protects data.                               |
| `NEXT_PUBLIC_SITE_URL`                 | client/public |      yes | Canonical application origin used for the allowlisted OAuth callback. |

Values with `NEXT_PUBLIC_` are bundled into client code and must never contain secrets. Keep real environment files out of version control.
