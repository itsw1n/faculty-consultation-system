# Architecture Overview

## Runtime shape

- Frontend: Next.js
- Backend/data: Supabase
- Platform: web
- Architecture profile: medium
- Authentication: undecided

The generated application is intentionally a small vertical slice. Add domain features only after recording product goals and boundaries in `CONTEXT.md`. Keep entry points thin, validate at trust boundaries, and enforce authorization beside protected data or side effects.

## Verification boundary

The starter is considered healthy when its lint/typecheck/tests/build commands pass. Documentation explains those executable patterns; it does not override working code and tests.
