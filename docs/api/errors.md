# Error Behavior

The application intentionally does not expose database errors, secrets, or personal records in browser messages.

- Invalid submitted fields return a safe validation message or reject the action.
- Missing authentication redirects to the sign-in flow.
- Insufficient role access is rejected by server authorization and RLS.
- Booking conflicts report that the slot is no longer available.
- Duplicate department values report that code and name must be unique.
- Unexpected rendering failures use the application error boundary; unknown routes use the not-found page.

Detailed database errors remain server-side. There is no stable public error-code API in v1.
