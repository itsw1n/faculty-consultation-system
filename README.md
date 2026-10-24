# Faculty Consultation and Scheduling System

A web application for **Assumption College of Davao** that brings consultation scheduling, faculty decisions, and consultation records into one place.

Students find an available faculty member and request a consultation. Faculty publish schedules, approve or reject requests, and record outcomes. Administrators manage school accounts, departments, and consultation summaries.

## Reviewing the project

Start with the [system walkthrough](docs/walkthrough.md). It explains a complete consultation step by step, followed by the Faculty and Admin responsibilities. You do not need to install the app to read it.

| To understand…                                         | Read                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| The users, purpose, and scope                          | [Product overview](docs/concepts/product.md)                 |
| The workflows and screens                              | [System walkthrough](docs/walkthrough.md)                    |
| Booking rules, statuses, and privacy                   | [Business rules](docs/concepts/rules.md)                     |
| How the application components communicate             | [Architecture](docs/concepts/architecture.md)                |
| Tables and their relationships                         | [Database model and ER diagram](docs/concepts/data-model.md) |
| HTTP endpoints, server actions, and database functions | [API reference](docs/reference/api.md)                       |
| How to run and test the project                        | [Getting started](docs/getting-started.md)                   |

The [documentation index](docs/README.md) provides the recommended reading order and the remaining technical references. [Implementation status](PROGRESS.md) distinguishes completed features from deployment work still required.

## Technology

| Part                  | Technology                    | Responsibility                                                 |
| --------------------- | ----------------------------- | -------------------------------------------------------------- |
| Application           | Next.js 16, React, TypeScript | Pages, interactive forms, and server-side request handling     |
| Identity and database | Supabase Auth, PostgreSQL     | Sign-in, stored records, permissions, and atomic booking rules |
| Interface             | React Aria, Tailwind CSS      | Accessible controls and a shared responsive design             |
| Consultation email    | Resend                        | Optional status messages and reminders                         |

Private consultation descriptions and outcomes are shown only to the student and assigned faculty. Admin screens show consultation metadata, categories, and aggregate summaries.

## Run locally

Follow [Getting started](docs/getting-started.md) for prerequisites, environment configuration, and the local Supabase keys before running:

```bash
npm ci
npm run supabase:start
npm run supabase:reset
npm run dev
```

`supabase:reset` rebuilds the local database and loads demo data; it clears existing local development data. The setup guide includes [demo accounts](docs/getting-started.md#demo-accounts) and local email verification instructions.

## Verification

```bash
npm run check
npm run build
npm run supabase:test
npm run test:e2e
```

The [testing guide](docs/getting-started.md#validate) explains what these commands check and when database-backed browser tests run. The [manual test cases](docs/reference/manual-test-cases.md) cover the primary consultation workflow end to end. [Technical evidence](docs/evidence/README.md) contains earlier local verification captures. Team members can place their AI-use evidence in their own folders under [ai-evidence](ai-evidence/README.md).

## Development and deployment

Branch, commit, and pull request conventions are in [Contributing](docs/contributing.md). Configuration and deployment instructions are in [Environment reference](docs/reference/environment.md) and [Operations](docs/operations.md).
