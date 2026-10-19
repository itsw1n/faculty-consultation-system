# Documentation

Assumption College of Davao — faculty consultation and scheduling system. This folder is the map. Start with the path that matches you.

## Reading paths

| If you are… | Read in order |
| ----------- | ------------- |
| **New to the project** | [`getting-started.md`](getting-started.md) → [`concepts/product.md`](concepts/product.md) → [`concepts/architecture.md`](concepts/architecture.md) → [`reference/api.md`](reference/api.md) |
| **Working day to day** | [`reference/api.md`](reference/api.md) · [`reference/environment.md`](reference/environment.md) · [`reference/design.md`](reference/design.md) · [`concepts/rules.md`](concepts/rules.md) |
| **Taking over the project** | [`../CONTEXT.md`](../CONTEXT.md) → [`../PROGRESS.md`](../PROGRESS.md) → [`concepts/`](concepts/) → [`operations.md`](operations.md) |

## All documents

| Document | Purpose |
| -------- | ------- |
| [`getting-started.md`](getting-started.md) | Install, configure, run, first admin, faculty onboarding |
| [`concepts/product.md`](concepts/product.md) | Who it is for, roles, journeys, categories, scope |
| [`concepts/rules.md`](concepts/rules.md) | Exact account and consultation rules |
| [`concepts/architecture.md`](concepts/architecture.md) | System boundaries, request flow, auth model, email |
| [`concepts/data-model.md`](concepts/data-model.md) | Tables, enums, constraints, RLS, RPCs |
| [`reference/api.md`](reference/api.md) | Pages, HTTP routes, server actions, errors |
| [`reference/environment.md`](reference/environment.md) | Environment variables and approved domains |
| [`reference/design.md`](reference/design.md) | Design tokens and UI conventions |
| [`operations.md`](operations.md) | Deploy, scheduled email, releases |
| [`contributing.md`](contributing.md) | Branch, commit, and pull request rules |

Root-level documents: [`README.md`](../README.md) (project entry), [`CONTEXT.md`](../CONTEXT.md) (product intent), [`AGENTS.md`](../AGENTS.md) (agent contract), [`PROGRESS.md`](../PROGRESS.md) (status).

## Ownership rule

One fact lives in exactly one file. If another document needs it, it links here instead of restating it. When a fact changes, update its owner file.
