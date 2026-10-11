# Faculty Consultation and Scheduling System
## Implementation Gap Tracker — v0.2

**Project:** Assumption College of Davao · IT 305 Mini-Capstone  
**Updated:** 11 October 2026  
**Specification:** `ACD_Faculty_Consultation_System_Reference_v0.2.docx` (or matching `ACD_System_Reference_v0.2.md`)

> **This is a worklist, not a feature specification.** For how a feature should behave, read Section 4 of the System Reference. For what to build or verify next, use this tracker. The uploaded application has not been run; presence in source code is **not proof that it works**.

### How to use this tracker

1. Choose an unfinished **P0** ticket for the IT 305 midterm first.
2. Open the listed code files and check whether working logic is already present. Avoid adding duplicate components.
3. Implement the smallest needed change, then run the feature with realistic test accounts.
4. Record the **test result**, a **screenshot/video when required**, and the **actual commit hash**.
5. Change the ticket status to `TESTED` only after the action demonstrably works. Update the master reference only if an agreed requirement changes.

**Status legend:** `CODE PRESENT — UNTESTED` = found in source; `PARTIAL` = known missing behavior; `PLANNED` = not found; `VERIFY` = needs runtime/test or school confirmation; `TESTED` = proof recorded.

---

## A. Start here: Midterm checkpoint (P0)

| ID | Requirement | Current status | Next action / passing evidence |
|---|---|---|---|
| **P0-01** | Run the existing system | **VERIFY** | Preserve ZIP and Git history; configure test Supabase/Google; successfully start Next.js and sign in with test accounts. |
| **P0-02** | Week 1 Integration Plan v2 | **DRAFT** | Align architecture/data flows with *running* code; prepare the short midterm document and dependency table. |
| **P0-03** | Week 2 API call | **PARTIAL** | Demonstrate one authorized HTTP request whose JSON response is visibly used by the app; capture method, status and response in DevTools/Postman. Suggested route: `GET /api/faculty/[facultyId]/availability`. |
| **P0-04** | Week 3 complete database CRUD | **PARTIAL** | Faculty availability currently has Create/Read/Delete but no Update. Add update on unreserved slots, test all four operations on one resource, collect DB before/after evidence. |
| **P0-05** | Week 4 login + role restriction | **CODE PRESENT — UNTESTED** | Test Google OAuth, approved Student/Faculty access, unauthorized Admin route blocking and row-level rules. Enforce two approved institutional domains at application, approval and protected-access stages. |
| **P0-06** | Admin review and identity rules | **PARTIAL** | Support Admin correction of role and department; verify single/bulk approval cannot approve outside-domain accounts; safely bootstrap first Admin once. |
| **P0-07** | Midterm evidence package | **NOT COLLECTED** | Gather member Git commits, unedited 3–5 minute app video, API screenshot, CRUD evidence, authentication evidence, individual YouTube walkthroughs and signed AI declarations. |

### P0 acceptance checks

- [ ] Student cannot reach protected `/admin` pages or retrieve Admin-only data (403/redirect and server-side enforcement).
- [ ] Google account from a personal domain cannot submit an account application or be approved by single/bulk operations.
- [ ] Approved school-domain Student and Faculty accounts can enter only authorized dashboards.
- [ ] One genuine API response changes visible availability in the student booking UI.
- [ ] A Faculty creates, reads, updates and deletes **one resource type** using secure/parameterized database calls; reserved-slot modification is rejected.
- [ ] All screenshots/videos are real, dated where required, and contain no private student records or secrets.

**OAuth evidence issue:** The instructor asks for hashed-password database evidence, but Google-only Supabase Auth does not expose local password hashes. Confirm acceptable equivalent evidence with the instructor; do not add artificial passwords or fabricate hashes.

---

## B. Target mini-capstone feature gaps (P1, after Week 1–4 baseline)

| ID | Feature | Source-code assessment | Concrete acceptance test |
|---|---|---|---|
| **P1-01** | Faculty slot creation and mode | Code present; **untested** | Faculty creates one IN_PERSON and one ONLINE slot; Student cannot alter mode. |
| **P1-02** | Faculty default consultation location | **PLANNED** | Profile default room pre-fills in-person slot; specific slot may override. |
| **P1-03** | Manual meeting link at approval | **PARTIAL** | Online Faculty enters Meet/Zoom URL while approving; involved Student can open link. |
| **P1-04** | Department-first directory | **PARTIAL / VERIFY** | Same-department Faculty appear first but cross-department searches and bookings work. |
| **P1-05** | Student cancellation and slot reopening | Code present; rules **need testing** | Future student cancellation is retained in history and opens the slot; past slot never reopens. |
| **P1-06** | Faculty cancellation choice | **PLANNED** | Faculty cancels assigned consultation, chooses `Reopen` or `Block`, and student is notified. |
| **P1-07** | Rescheduling proposal + response | **PLANNED** | Faculty holds proposed slot; student accepts/declines; decline releases proposed slot and keeps request `Needs Rescheduling`. |
| **P1-08** | No-show status | **PLANNED** | After appointment has elapsed, Faculty records `NO_SHOW`; it is not counted as completed. |
| **P1-09** | Walk-in consultation records | **PLANNED** | Faculty records registered OR unregistered student name + department without student number or application login. |
| **P1-10** | Faculty consultation-history export | **PLANNED** | Faculty exports **own** records only (CSV sufficient initially), never another faculty's private outcomes. |
| **P1-11** | Optional student-visible outcomes | Code present; **untested** | Faculty may complete with blank remarks; involved Student can view all saved remarks. |
| **P1-12** | In-app and institutional email updates | Code present; **untested** | Approval/cancel/reschedule/no-show events notify appropriate users without sensitive outcomes in email. |
| **P1-13** | Approved user department correction | **PLANNED** | Admin can correct an approved account's department without bypassing access checks. |

**Current code entry points:** `src/features/auth/`, `src/features/availability/`, `src/features/booking/`, `src/features/consultations/`, `src/features/notifications/`, `src/app/admin/`, `src/app/faculty/`, `src/app/student/`, and `supabase/migrations/`. Specific paths and migrations must be confirmed before editing.

---

## C. Not required now (P2 / school approval)

| Item | Reason to defer |
|---|---|
| Program Head departmental reporting | Agreed faculty-first scope; separate authorized reporting permission needs institutional validation. |
| Special PAASCU PDF format | Interviews support preserving evidence but did not provide a mandatory institutional report template. |
| Direct SIS integration | No ICTC approval or integration contract gathered. |
| Full messaging / document upload | Additional storage, privacy and development burden for a mini-capstone. |
| Built-in video calling or automatic Google Meet creation | Faculty will manually provide an external link. |
| Expiration of unanswered reschedule proposals | Team still needs a simple operational policy; temporary hold is agreed provisionally. |
| Formal digital retention period | Interview mentioned approximately three years, but official policy is not supplied. |

---

## D. Practical work order

**First:** Get the existing ZIP running with disposable test accounts. Log reproducible errors *before* fixing them.  
**Second:** Meet the API + complete CRUD + role-denial midterm demonstrations.  
**Third:** Fix the main booking lifecycle and test conflicts/cancellation.  
**Fourth:** Add faculty cancellation, rescheduling, No-show, walk-in and faculty export.  
**Fifth:** Verify notifications, responsiveness and all role-specific views.  
**Last:** Update the tracker with tests, evidence and commits; revise specification if decisions changed.

### Progress record template (copy for each completed ticket)

```text
Ticket: P0-04
Owner: [member]
Files changed: [paths]
Test run / result: [command or user flow + actual result]
Evidence: [path in repo, no sensitive information]
Commit: [real commit hash]
Status: TESTED / BLOCKED
Open issue: [if any]
```

### Items to confirm outside the code

- [ ] Exact two ACD institutional email domains (both valid for Student or Faculty).
- [ ] School-approved first System Admin account.
- [ ] School consultation form/logbook required fields and formal retention rule.
- [ ] Instructor-approved substitute for Google OAuth password-hash evidence.
- [ ] Team members' real Git contributions and dates.

---

*Static audit only. No live app, migration, OAuth, API or database flow has been executed in producing v0.2.*
