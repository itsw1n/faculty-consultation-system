import { expect, test, type Page } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  bookConsultationAs,
  cancelConsultationAs,
  decideConsultationAs,
  ensureAccount,
  ensureFacultyProfile,
  ensureSlot,
  getDepartments,
  getLatestConsultationForStudent,
  getNotifications,
  seedNotification,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'

const password = 'Password123!'

async function setupStudent(prefix: string, name?: string) {
  const email = uniqueEmail(`${prefix}-student`)
  const student = await ensureAccount(
    email,
    password,
    name ?? `E2E Student ${Date.now()}-${Math.floor(Math.random() * 10000)}`
  )
  await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
  return { student, email }
}

async function setupFaculty(prefix: string, departmentId: string) {
  const email = uniqueEmail(`${prefix}-faculty`)
  const name = `E2E Faculty ${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const faculty = await ensureAccount(email, password, name)
  await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
  await ensureFacultyProfile(faculty.id, departmentId)
  return { faculty, email, name }
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

test.describe('Student booking journey', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  test.setTimeout(180_000)

  test('dashboard counts match the database', async ({ page }) => {
    const departments = await getDepartments()
    const { faculty } = await setupFaculty('e2e-dash', departments[0]!.id)
    const { email } = await setupStudent('e2e-dash')
    const pendingSlot = await ensureSlot(faculty.id)
    const approvedSlot = await ensureSlot(faculty.id, { start_time: '11:00', end_time: '12:00' })
    await bookConsultationAs(email, password, pendingSlot.id)
    const approvedId = await bookConsultationAs(email, password, approvedSlot.id)
    await decideConsultationAs(faculty.email, password, approvedId, true)

    await signInAs(page, email, password)
    await page.goto('/student')
    const valueFor = (label: string) =>
      page.locator('dt', { hasText: label }).locator('xpath=..').locator('dd')
    const upcomingCount = valueFor('Upcoming')
    const pendingCount = valueFor('Pending')
    await expect(upcomingCount).toHaveText('1')
    await expect(pendingCount).toHaveText('1')
    await expect(page.getByText('Recent consultations')).toBeVisible()
  })

  test('directory search and department filter narrow the list', async ({ page }) => {
    const departments = await getDepartments()
    const first = await setupFaculty('e2e-dir', departments[0]!.id)
    const second = await setupFaculty('e2e-dir', departments[1]!.id)
    const { email } = await setupStudent('e2e-dir')

    await signInAs(page, email, password)
    await page.goto('/student/book')

    await page.getByLabel('Faculty name').fill(first.name)
    await page.waitForURL('**/student/book?search=**', { timeout: 30_000 })
    await expect(page.locator('article', { hasText: first.name })).toHaveCount(1)
    await expect(page.locator('article', { hasText: second.name })).toHaveCount(0)

    await page.getByLabel('Faculty name').fill('')
    // Wait until the cleared search actually flushes to the URL.
    await page.waitForFunction(() => !new URL(window.location.href).searchParams.has('search'))
    await page.getByRole('button', { name: 'Department' }).click()
    await page.getByRole('option', { name: departments[1]!.code }).click()
    await expect(page.locator('article', { hasText: second.name })).toBeVisible()
    await expect(page.locator('article', { hasText: first.name })).toHaveCount(0)
  })

  test('wizard guards each step until valid', async ({ page }) => {
    const departments = await getDepartments()
    const { faculty } = await setupFaculty('e2e-wiz', departments[0]!.id)
    await ensureSlot(faculty.id)
    const { email } = await setupStudent('e2e-wiz')

    await signInAs(page, email, password)
    await page.goto(`/student/book/${faculty.id}`)

    const continueButton = page.getByRole('button', { name: 'Continue' })
    await expect(continueButton).toBeDisabled()
    await (await findVisibleSlot(page, 'OPEN')).click()
    await expect(continueButton).toBeEnabled()
    await continueButton.click()

    const reviewButton = page.getByRole('button', { name: 'Review request' })
    await expect(reviewButton).toBeDisabled()
    await page.getByRole('button', { name: 'Purpose' }).click()
    await page.getByRole('option', { name: 'Personal concern' }).click()
    await expect(reviewButton).toBeEnabled()
  })

  test('consultation list filters and detail shows the record', async ({ page }) => {
    const departments = await getDepartments()
    const { faculty } = await setupFaculty('e2e-list', departments[0]!.id)
    const { student, email } = await setupStudent('e2e-list')
    const pendingSlot = await ensureSlot(faculty.id)
    const cancelledSlot = await ensureSlot(faculty.id, { start_time: '13:00', end_time: '14:00' })
    await bookConsultationAs(email, password, pendingSlot.id)
    const cancelledId = await bookConsultationAs(email, password, cancelledSlot.id)
    await cancelConsultationAs(email, password, cancelledId)

    await signInAs(page, email, password)
    await page.goto('/student/consultations')

    await page.getByRole('button', { name: 'Status' }).click()
    await page.getByRole('option', { name: 'Cancelled' }).click()
    await expect(page.getByRole('row').filter({ hasText: 'Cancelled' })).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: 'Pending' })).toHaveCount(0)

    const pending = await getLatestConsultationForStudent(student.id)
    await page.goto(`/student/consultations/${pending!.id}`)
    await expect(page.getByText('Consultation details')).toBeVisible()
    await expect(page.getByText('None provided')).toBeVisible()
  })

  test('notifications inbox marks items read', async ({ page }) => {
    const { student, email } = await setupStudent('e2e-notif')
    await seedNotification(student.id, { type: 'CONSULTATION_APPROVED' })
    await seedNotification(student.id, {
      type: 'CONSULTATION_REJECTED',
      title: 'Request declined',
      message: 'Your requested time was not approved.',
    })

    await signInAs(page, email, password)
    await page.goto('/notifications')
    await expect(page.getByLabel('2 unread notifications')).toBeVisible()
    await page.getByRole('button', { name: 'Mark read' }).first().click()
    await expect(page.getByLabel('1 unread notifications')).toBeVisible()
    await page.getByRole('button', { name: 'Mark all as read' }).click()
    // Wait for the server to persist before reading back.
    await expect
      .poll(async () => (await getNotifications(student.id)).every((n) => n.read_at !== null))
      .toBe(true)
    // The inbox lists read items too, so "all read" means no unread actions remain.
    await page.reload()
    await expect(page.getByLabel('0 unread notifications')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mark read' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Mark all as read' })).toHaveCount(0)
  })
})
