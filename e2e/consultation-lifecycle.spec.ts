import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  bookConsultationAs,
  decideConsultationAs,
  ensureAccount,
  ensureFacultyProfile,
  ensureSlot,
  getConsultation,
  getFirstDepartment,
  getLatestConsultationForStudent,
  getNotifications,
  getSlot,
  setProfile,
  tomorrowIso,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'
import { waitForHydration } from './helpers/hydration'

const password = 'Password123!'

async function setupPair(prefix: string, slotDate = tomorrowIso()) {
  const department = await getFirstDepartment()
  const facultyName = `E2E Faculty ${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const facultyEmail = uniqueEmail(`${prefix}-faculty`)
  const faculty = await ensureAccount(facultyEmail, password, facultyName)
  await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
  await ensureFacultyProfile(faculty.id, department.id)
  const studentEmail = uniqueEmail(`${prefix}-student`)
  const studentName = `E2E Student ${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const student = await ensureAccount(studentEmail, password, studentName)
  await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
  const slot = await ensureSlot(faculty.id, { date: slotDate })
  return { faculty, facultyName, student, studentName, slot, facultyEmail, studentEmail }
}

async function findVisibleSlot(page: Page, status: 'OPEN' | 'RESERVED') {
  // The wizard shows one day per tab on mobile and every day on desktop.
  // Slot dates depend on server/client timezones, so scan for the visible one.
  const direct = page.getByRole('button', { name: new RegExp(status) }).first()
  if ((await page.getByRole('tab').count()) === 0) return direct
  for (let attempt = 0; attempt < 2; attempt++) {
    const tabs = page.getByRole('tab')
    const count = await tabs.count()
    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click()
      const candidate = page.getByRole('button', { name: new RegExp(status) }).first()
      if (await candidate.isVisible()) return candidate
    }
    const nextWeek = page.getByRole('button', { name: 'Next week' })
    if (await nextWeek.isDisabled()) break
    await nextWeek.click()
  }
  throw new Error(`No visible ${status} slot in the wizard`)
}

test.describe('Consultation lifecycle', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  // Multi-page journey on a dev server: first-hit route compiles are slow.
  test.setTimeout(180_000)

  test('student books, faculty approves, faculty completes with outcome', async ({ page }) => {
    const { faculty, facultyName, student, studentName, slot, facultyEmail, studentEmail } =
      await setupPair('e2e-saga')

    // 1. Student books through the real wizard.
    await signInAs(page, studentEmail, password)
    await page.goto('/student/book')
    await waitForHydration(page, page.getByLabel('Faculty name'))
    await page.getByLabel('Faculty name').fill(facultyName)
    // Wait for the search debounce to flush so the card is stable before clicking.
    await page.waitForURL('**/student/book?search=**', { timeout: 30_000 })
    const card = page.locator('article', { hasText: facultyName })
    await expect(card).toBeVisible()
    await card.getByRole('link', { name: 'View schedule' }).click()
    await page.waitForURL(/\/student\/book\/[0-9a-f-]{36}/, { timeout: 90_000 })
    await (await findVisibleSlot(page, 'OPEN')).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Category' }).click()
    await page.getByRole('option', { name: 'Academic concern' }).click()
    await page.getByRole('button', { name: 'Review request' }).click()
    await expect(page.getByText('Academic concern')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm booking request' }).click()
    await expect(page).toHaveURL('/student/consultations', { timeout: 30_000 })
    await expect(page.getByRole('row').filter({ hasText: facultyName })).toBeVisible()

    const booked = await getLatestConsultationForStudent(student.id)
    expect(booked?.status).toBe('PENDING')
    expect((await getSlot(slot.id))?.status).toBe('RESERVED')
    expect(
      (await getNotifications(faculty.id)).some((n) => n.type === 'CONSULTATION_REQUEST')
    ).toBe(true)

    // 2. Faculty approves. The request leaves the pending queue...
    await signInAs(page, facultyEmail, password)
    await page.goto('/faculty/requests')
    const row = page.getByRole('row').filter({ hasText: studentName })
    await waitForHydration(page, row.getByRole('button', { name: 'Approve' }))
    await row.getByRole('button', { name: 'Approve' }).click()
    const dialog = page.getByRole('alertdialog')
    await waitForHydration(page, dialog.getByRole('button', { name: 'Approve' }))
    await dialog.getByRole('button', { name: 'Approve' }).click()
    await expect(row).toHaveCount(0, { timeout: 30_000 })

    expect((await getConsultation(booked!.id))?.status).toBe('APPROVED')
    expect((await getSlot(slot.id))?.status).toBe('BOOKED')
    expect(
      (await getNotifications(student.id)).some((n) => n.type === 'CONSULTATION_APPROVED')
    ).toBe(true)

    // ...and shows up as approved in the history list.
    await page.goto('/faculty/consultations')
    const historyRow = page.getByRole('row').filter({ hasText: studentName })
    await waitForHydration(
      page,
      historyRow.getByRole('button', { name: `View consultation details with ${studentName}` })
    )
    await expect(historyRow.getByText('Approved')).toBeVisible()

    // 3. Faculty completes from the details modal with an outcome note.
    await historyRow
      .getByRole('button', { name: `View consultation details with ${studentName}` })
      .click()
    const details = page.getByRole('dialog')
    await details.getByLabel('Outcome Note').fill('Reviewed study plan.')
    await details.getByRole('button', { name: 'Mark as Completed' }).click()
    const confirmation = page.getByRole('alertdialog')
    await expect(confirmation.getByText('Mark consultation as completed?')).toBeVisible()
    await waitForHydration(page, confirmation.getByRole('button', { name: 'Mark as Completed' }))
    await confirmation.getByRole('button', { name: 'Mark as Completed' }).click()
    await expect(details.getByRole('status')).toHaveText('Consultation marked as completed.')
    await expect(historyRow.getByText('Completed')).toBeVisible()

    expect((await getConsultation(booked!.id))?.status).toBe('COMPLETED')
    expect((await getSlot(slot.id))?.status).toBe('CLOSED')

    // 4. Student sees the outcome on the detail page.
    await signInAs(page, studentEmail, password)
    await page.goto(`/student/consultations/${booked!.id}`)
    await waitForHydration(page)
    await expect(page.getByText('Reviewed study plan.')).toBeVisible()
  })

  test('faculty reject reopens the slot and notifies the student', async ({ page }) => {
    const { student, studentName, slot, facultyEmail, studentEmail } = await setupPair('e2e-reject')
    const consultationId = await bookConsultationAs(studentEmail, password, slot.id)

    await signInAs(page, facultyEmail, password)
    await page.goto('/faculty/requests')
    const row = page.getByRole('row').filter({ hasText: studentName })
    await waitForHydration(page, row.getByRole('button', { name: 'Reject' }))
    await row.getByRole('button', { name: 'Reject' }).click()
    const dialog = page.getByRole('alertdialog')
    await waitForHydration(page, dialog.getByRole('button', { name: 'Reject' }))
    await dialog.getByRole('button', { name: 'Reject' }).click()
    await expect
      .poll(() => getConsultation(consultationId).then((row) => row?.status), { timeout: 30_000 })
      .toBe('REJECTED')
    await expect(row).toHaveCount(0, { timeout: 30_000 })

    expect((await getConsultation(consultationId))?.status).toBe('REJECTED')
    expect((await getSlot(slot.id))?.status).toBe('OPEN')
    expect(
      (await getNotifications(student.id)).some((n) => n.type === 'CONSULTATION_REJECTED')
    ).toBe(true)
  })

  test('faculty requests filter by status and default to pending', async ({ page }) => {
    const { faculty, studentName, slot, facultyEmail, studentEmail } =
      await setupPair('e2e-request-filter')

    await bookConsultationAs(studentEmail, password, slot.id)
    const approvedSlot = await ensureSlot(faculty.id, {
      start_time: '11:00',
      end_time: '12:00',
    })
    const approvedId = await bookConsultationAs(studentEmail, password, approvedSlot.id)
    await decideConsultationAs(facultyEmail, password, approvedId, true)

    await signInAs(page, facultyEmail, password)
    await page.goto('/faculty/requests')

    const statusFilter = page.getByRole('button', { name: 'Status' })
    await waitForHydration(page, statusFilter)
    await expect(statusFilter).toContainText('Pending')

    const row = page.getByRole('row').filter({ hasText: studentName })
    await expect(row).toHaveCount(1)
    await expect(row.getByText('Pending', { exact: true })).toBeVisible()
    await expect(row.getByText('Approved', { exact: true })).toHaveCount(0)

    await statusFilter.click()
    await page.getByRole('option', { name: 'Approved' }).click()

    await expect(page).toHaveURL(/\/faculty\/requests\?status=APPROVED/)
    await expect(statusFilter).toContainText('Approved')
    await expect(row).toHaveCount(1)
    await expect(row.getByText('Approved', { exact: true })).toBeVisible()
    await expect(row.getByText('Pending', { exact: true })).toHaveCount(0)

    const mobileNavigation = page
      .locator('details')
      .filter({ has: page.getByLabel('Open navigation') })
    await mobileNavigation.evaluate((node) => {
      const details = node as HTMLDetailsElement
      details.open = true
    })
    await page.locator('a[href="/faculty/consultations"]:visible').click()
    await expect(page).toHaveURL('/faculty/consultations')
    await page.goBack()
    await expect(page).toHaveURL(/\/faculty\/requests\?status=APPROVED/)
    await expect(statusFilter).toContainText('Approved')
    await expect(row).toHaveCount(1)
    await expect(row.getByText('Approved', { exact: true })).toBeVisible()
    await expect(row.getByText('Pending', { exact: true })).toHaveCount(0)

    await page.reload()
    await expect(page).toHaveURL(/\/faculty\/requests\?status=APPROVED/)
    await expect(statusFilter).toContainText('Approved')
    await expect(row).toHaveCount(1)
    await expect(row.getByText('Approved', { exact: true })).toBeVisible()
    await expect(row.getByText('Pending', { exact: true })).toHaveCount(0)
  })

  test('faculty downloads only own consultation records in the selected date range', async ({
    page,
  }) => {
    const date = tomorrowIso()
    const { studentName, slot, facultyEmail, studentEmail } = await setupPair(
      'e2e-faculty-export',
      date
    )
    const consultationId = await bookConsultationAs(
      studentEmail,
      password,
      slot.id,
      'ACADEMIC',
      'private test notes'
    )
    await decideConsultationAs(facultyEmail, password, consultationId, true)

    const unrelated = await setupPair('e2e-faculty-export-other', date)
    await bookConsultationAs(unrelated.studentEmail, password, unrelated.slot.id)

    await signInAs(page, facultyEmail, password)
    await page.goto('/faculty/consultations')
    await page.locator('input[name="from"]').fill(date)
    await page.locator('input[name="to"]').fill(date)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`faculty-consultations-${date}-to-${date}.csv`)
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
    const csv = await readFile(downloadPath!, 'utf8')

    expect(csv).toContain(studentName)
    expect(csv).toContain('APPROVED')
    expect(csv).not.toContain(unrelated.studentName)
    expect(csv).not.toContain('private test notes')
    expect(csv).not.toContain('meeting.example')
  })

  test('student cancel reopens the slot and notifies the faculty', async ({ page }) => {
    const { faculty, facultyName, slot, studentEmail } = await setupPair('e2e-cancel')
    const consultationId = await bookConsultationAs(studentEmail, password, slot.id)

    await signInAs(page, studentEmail, password)
    await page.goto('/student/consultations')
    const row = page.getByRole('row').filter({ hasText: facultyName })
    await waitForHydration(page, row.getByRole('button', { name: 'Cancel' }))
    await row.getByRole('button', { name: 'Cancel' }).click()
    const dialog = page.getByRole('alertdialog')
    await waitForHydration(page, dialog.getByRole('button', { name: 'Cancel' }))
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(row.getByText('Cancelled')).toBeVisible({ timeout: 30_000 })

    expect((await getConsultation(consultationId))?.status).toBe('CANCELLED')
    expect((await getSlot(slot.id))?.status).toBe('OPEN')
    expect(
      (await getNotifications(faculty.id)).some((n) => n.type === 'CONSULTATION_CANCELLED')
    ).toBe(true)
  })

  test('a taken slot is unclickable for a second student', async ({ page }) => {
    const { slot, facultyName, studentEmail } = await setupPair('e2e-double')
    await bookConsultationAs(studentEmail, password, slot.id)
    const otherEmail = uniqueEmail('e2e-double-other')
    const other = await ensureAccount(otherEmail, password, `E2E Other ${Date.now()}`)
    await setProfile(other.id, { role: 'STUDENT', account_status: 'APPROVED' })

    await signInAs(page, otherEmail, password)
    await page.goto('/student/book')
    await waitForHydration(page, page.getByLabel('Faculty name'))
    await page.getByLabel('Faculty name').fill(facultyName)
    // Wait for the search debounce to flush so the card is stable before clicking.
    await page.waitForURL('**/student/book?search=**', { timeout: 30_000 })
    const card = page.locator('article', { hasText: facultyName })
    await expect(card).toBeVisible()
    await card.getByRole('link', { name: 'View schedule' }).click()
    await page.waitForURL(/\/student\/book\/[0-9a-f-]{36}/, { timeout: 90_000 })
    await expect(await findVisibleSlot(page, 'RESERVED')).toBeDisabled()

    expect(await getLatestConsultationForStudent(other.id)).toBeNull()
  })
})
