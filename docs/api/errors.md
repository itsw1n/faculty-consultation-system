# Error Behavior

The application intentionally does not expose database errors, secrets, or personal records in browser messages.

- Invalid submitted fields return a safe validation message or reject the action.
- Missing authentication redirects to the sign-in flow.
- An authenticated user with the wrong role or account status is redirected to `/auth/continue`.
- Insufficient role access is rejected by server authorization and RLS.
- Booking conflicts report that the slot is no longer available.
- Lifecycle conflicts ask the user to refresh because the state changed.
- Duplicate department values report that code and name must be unique.
- Email processing returns `401` for a bad callback secret and `503` when the outbox is unavailable.
- Unexpected rendering failures use the application error boundary; unknown routes use the not-found page.

Detailed database and provider errors remain server-side. There is no stable public error-code API in v1.
