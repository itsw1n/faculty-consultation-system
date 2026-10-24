# Documentation guide

This guide explains the Faculty Consultation and Scheduling System for Assumption College of Davao. Start with the user workflows, then follow the technical details as needed.

## Recommended reading order for a project review

| Step | Document                                            | Question it answers                                                    |
| ---- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| 1    | [Product overview](concepts/product.md)             | Why does the system exist, and who uses it?                            |
| 2    | [System walkthrough](walkthrough.md)                | What happens when a student books and faculty respond?                 |
| 3    | [Business rules](concepts/rules.md)                 | Which actions are allowed, and what happens to a slot?                 |
| 4    | [Architecture](concepts/architecture.md)            | How do the browser, server, database, and email service work together? |
| 5    | [Database model](concepts/data-model.md)            | What records are stored, and how are they related?                     |
| 6    | [API reference](reference/api.md)                   | What inputs, permissions, results, and errors do the interfaces have?  |
| 7    | [Getting started](getting-started.md)               | How can I run the demo and verify its behavior?                        |
| 8    | [Manual test cases](reference/manual-test-cases.md) | How can I verify the complete consultation workflow?                   |

For a quick review, read the product overview and walkthrough first. Technical terms are explained in the [architecture glossary](concepts/architecture.md#technical-terms).

## Test the application

Use the [core test cases](reference/manual-test-cases.md) to test the main workflows. The 12 numbered cases have expected result, actual result, and pass/fail columns, followed by a bug log. Automated commands are in [Getting started](getting-started.md#validate).

## Reference and maintenance

| Document                                            | Use it for                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| [Design reference](reference/design.md)             | Institutional branding, reusable components, and responsive conventions |
| [Environment reference](reference/environment.md)   | Public configuration, server-only values, and auth email setup          |
| [Manual test cases](reference/manual-test-cases.md) | Primary workflow checks and a bug log                                   |
| [Operations](operations.md)                         | Hosting, scheduled email, and the release process                       |
| [Contributing](contributing.md)                     | Branch names, commits, and pull requests                                |
| [Technical evidence](evidence/README.md)            | Context for saved local verification artifacts                          |
| [Team AI-use evidence](../ai-evidence/README.md)    | Each member's evidence folder                                           |
| [Implementation status](../PROGRESS.md)             | Completed features and outstanding deployment work                      |

## For developers

Start with [local setup](getting-started.md), then read the [architecture](concepts/architecture.md). Look up specific contracts in the [API reference](reference/api.md), exact behavior in [business rules](concepts/rules.md), and persistence in the [database model](concepts/data-model.md).

[CONTEXT.md](../CONTEXT.md) records project constraints and key decisions. [AGENTS.md](../AGENTS.md) provides repository instructions for coding agents; it is not required reading for a teacher reviewing the application.

## Keeping these documents consistent

The walkthrough explains the experience; the rules define behavior; the API reference describes interfaces; the database model describes storage. Link to the document that owns a detail instead of maintaining several copies. Verify statements against the implementation and tests when updating them.
