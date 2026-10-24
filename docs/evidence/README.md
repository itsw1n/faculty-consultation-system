# Technical verification evidence

These are earlier local verification captures. They provide context for a project review; current automated tests are the repeatable checks of behavior.

| Artifact                                      | What it records                                    | How to interpret it                                                                                                                                                      |
| --------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Password hash inspection](password-hash.txt) | Hash prefixes and lengths from local test accounts | Shows bcrypt-format stored values rather than plaintext passwords; no full hashes are included.                                                                          |
| [Admin route check](admin-gate.txt)           | An authenticated Student visiting `/admin`         | The streamed page initially returned HTTP 200, then the browser redirected to the Student portal. A page's initial HTTP status alone does not demonstrate authorization. |
| [Admin route screenshot](admin-gate.png)      | The browser result of that earlier role-gate check | A historical capture of an earlier local check.                                                                                                                          |

The role-routing and export-access cases are in [auth-routing.spec.ts](../../e2e/auth-routing.spec.ts). Password verification and recovery cases are in [password-auth.spec.ts](../../e2e/password-auth.spec.ts). Run instructions and database requirements are in [Getting started](../getting-started.md#validate).

These technical captures are separate from the team's [AI-use evidence folders](../../ai-evidence/README.md).

Return to the [documentation guide](../README.md).
