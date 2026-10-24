# System walkthrough

[Documentation guide](README.md) · Next: [Business rules](concepts/rules.md)

This walkthrough follows a consultation from finding a schedule to recording its outcome. It explains the current screens and actions in the order a user encounters them.

For the purpose, users, and scope, read the [product overview](concepts/product.md). To try these steps, use the [local setup and demo accounts](getting-started.md#demo-accounts).

## 1. Sign in with a school account

A new user registers with an allowed school email and verifies it through the email link. New eligible accounts become Students. An administrator promotes an existing verified Student account when that person needs Faculty access; users do not choose their own privileged role.

After sign-in, the application opens the portal for the account's role. Password recovery is available from the sign-in page. Historical pending or rejected accounts are directed to their account-status screen instead of a portal.

## 2. Student: find faculty and request a time

The Student dashboard highlights the next confirmed consultation, pending requests, and recent activity.

1. Select **Book consultation** to open the faculty directory.
2. Search for a faculty member or filter by department, then open their schedule.
3. Choose a date and an **Open** time slot. Reserved, booked, and closed slots cannot be requested.
4. Continue to **Details**, choose a consultation category, and optionally add a description.
5. Continue to **Review**, check the information, and select **Confirm Booking Request**.

Submitting creates a **Pending** consultation and reserves its slot. It is a request awaiting a faculty decision, not yet an approved appointment. If another student takes the slot first, the application asks the student to choose another time.

## 3. Faculty: publish availability and decide requests

The Faculty dashboard brings open slots, pending decisions, and upcoming confirmed consultations together.

Faculty use **My Availability** to add a future date, start and end times, and meeting mode. In-person consultations need a location; online consultations can include a meeting link. Editing and removal are limited to eligible open slots without consultation history.

In **Consultation Requests**, faculty open a request and choose **Approve** or **Reject**, then confirm the decision. Approval books the reserved slot. Rejection releases it for another request. The Student sees the updated status and receives an in-app notification.

The **Status** filter defaults to **Pending** on **Consultation Requests**; choose another status to review past decisions from the same page.

## 4. Participants: review, cancel, or complete

**My Consultations** lets Students and Faculty search their own records, filter by status, and open details. Descriptions and outcome notes are participant-only. An online meeting link is shown to participants after approval and remains available for completed consultations.

A Student can cancel an eligible pending or approved consultation. After an approved consultation, the assigned Faculty member can save an optional outcome note and mark it **Completed**. Completion closes the slot and retains the consultation record.

The full state changes and conditions are defined in [Business rules](concepts/rules.md#booking-transitions).

## 5. Admin: manage the institution's records

The Admin dashboard summarizes approved accounts, consultation activity, and available capacity, with links to the management screens.

| Screen                   | Administrative task                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Manage Users**         | Search approved accounts, promote a verified Student to Faculty, or correct an eligible account's role, department, and faculty position |
| **Departments**          | Add department codes and names or update existing entries, with duplicate-value feedback                                                 |
| **Consultation Records** | Search consultation metadata, filter by status, and export an aggregate CSV summary for a selected date range                            |

Admin records show the participants, schedule, category, and status. The CSV groups counts by date, department, category, and status. Neither includes private descriptions or outcomes. The export date fields affect the CSV, not the on-screen list.

## 6. Notifications and email

The header bell shows an unread count and recent notifications. **View all notifications** opens the account's inbox, where individual items or all items can be marked read. Notifications belong to their recipient; an Admin inbox does not combine everyone else's notifications.

Consultation status emails and next-day reminders are secondary to in-app notifications and depend on configured email delivery. Sign-up verification and password recovery emails are handled separately by Supabase Auth. See [Environment reference](reference/environment.md#auth-email-templates) for the distinction.

## How to demonstrate the system

A short demonstration can use three separate browser sessions for the [Student, Faculty, and Admin demo accounts](getting-started.md#demo-accounts):

1. As Faculty, add a future open slot that does not overlap an existing slot.
2. As Student, find that faculty member and submit a request for the slot.
3. As Faculty, approve the request and show its updated status and details.
4. As Student, show the approved consultation and its notification.
5. As Faculty, record an outcome and mark the consultation completed.
6. As Admin, find the record and export a summary, demonstrating that private notes remain absent.

This demonstration changes local data. Existing seeded records can also be inspected without creating a new booking. For validation commands and their prerequisites, use [Getting started](getting-started.md#validate).
