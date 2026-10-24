# Product overview

[Documentation guide](../README.md) · Next: [System walkthrough](../walkthrough.md)

The Faculty Consultation and Scheduling System is a web application for Assumption College of Davao. It gives Students a way to request faculty consultations, gives Faculty control over their availability and decisions, and gives administrators an organized view of accounts and consultation activity.

## The problem it addresses

A consultation needs a clear available time, an identified Student and Faculty member, a decision, and a record of what happened. The system brings these steps into one workflow so participants can check the same request status and schedule. It also prevents two active consultations from holding the same slot.

## Users and responsibilities

| Role    | Main responsibility                                                            | Portal     |
| ------- | ------------------------------------------------------------------------------ | ---------- |
| Student | Discover faculty, request consultations, and follow up on their own records    | `/student` |
| Faculty | Publish available times, decide requests, and record consultation outcomes     | `/faculty` |
| Admin   | Manage accounts and departments and review consultation metadata and summaries | `/admin`   |

An eligible new account becomes a Student after registration, with email verification required before sign-in. An Admin promotes an existing verified Student account to Faculty. First-admin setup is restricted to a designated school account. Exact eligibility and correction rules are in [Business rules](rules.md#account-and-role-rules).

## What each role can do

“Own” means records belonging to that Student; “assigned” means consultations with that Faculty member.

| Capability                                    | Student               | Faculty                         | Admin                                |
| --------------------------------------------- | --------------------- | ------------------------------- | ------------------------------------ |
| Browse faculty and request an open slot       | Yes                   | No                              | No                                   |
| Create and manage availability                | No                    | Own eligible slots              | No                                   |
| Approve or reject requests                    | No                    | Assigned pending requests       | No                                   |
| Cancel consultations                          | Own eligible requests | No                              | No                                   |
| Record an outcome and complete a consultation | No                    | Assigned approved consultations | No                                   |
| Read private descriptions and outcomes        | Own consultations     | Assigned consultations          | No                                   |
| Review consultation metadata and categories   | Own consultations     | Assigned consultations          | Institution-wide                     |
| Manage accounts and departments               | No                    | No                              | Yes, within account-correction rules |
| Export aggregate consultation summaries       | No                    | No                              | Yes                                  |
| Read and mark in-app notifications            | Own inbox             | Own inbox                       | Own inbox                            |

Role permissions are checked on the server and in database functions; hiding an interface control is not the permission check. See [Architecture](architecture.md#authorization).

## Main capabilities

- Faculty discovery with search and department filters.
- A three-step booking wizard: **Schedule → Details → Review**.
- In-person and online consultations.
- Request decisions, eligible cancellation, completion, and saved outcomes.
- Searchable consultation lists with status filters and additional pages loaded as needed.
- In-app notifications, with optional consultation email delivery.
- Administrative account correction, department management, and summary CSV export.
- Shared desktop and mobile navigation and components.

The consultation categories are grade, capstone, academic, personal, and other concerns. Categories are visible in administrative records and summaries; private descriptions and outcomes are restricted to participants.

## Scope and limitations

The current version does not include payments, native mobile applications, dark mode, user-editable approved roles or departments, bulk account approval in Manage Users, or administrative deletion of consultation history.

There is no direct integration with the school's Student Information System (SIS). That would require separate institutional approval. Exact institutional record fields and a retention period still need confirmation before the system could replace paper records.

Completed features and environment-specific deployment work are tracked in [Implementation status](../../PROGRESS.md). The [walkthrough](../walkthrough.md) shows the current screens; [Business rules](rules.md) defines their exact behavior.
