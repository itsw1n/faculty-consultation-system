import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  bookConsultationAs,
  decideConsultationAs,
  ensureAccount,
  ensureFacultyProfile,
  ensureSlot,
  getFirstDepartment,
  getSlotsForFaculty,
  setProfile,
  tomorrowIso,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'

const password = 'Password123!'

async function setupFaculty(prefix: string) {
  const department = await getFirstDepartment()
  const email = uniqueEmail(`${prefix}-faculty`)
  const faculty = await ensureAccount(email, password, `E2E Faculty ${Date.now()}`)
  await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
  await ensureFacultyProfile(faculty.id, department.id)
  return { faculty, email }
}

async function openAvailability(page: import('@playwright/test').Page, email: string) {
  await signInAs(page, email, password)
  await page.goto('/faculty/availability')
  await page.waitForTimeout(300)
}

test.describe('Faculty availability management', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  test.setTimeout(180_000)

  test('creates an open slot from the form', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-avail')

    await openAvailability(page, email)
    await page.getByRole('button', { name: 'Add Availability' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Date').fill(tomorrowIso())
    await dialog.getByLabel('Start').fill('09:00')
    await dialog.getByLabel('End').fill('10:00')
    await dialog.getByLabel('Location').fill('Room 202')
    await dialog.getByRole('button', { name: 'Add availability' }).click()

    const row = page.getByRole('row').filter({ hasText: 'Room 202' })
    await expect(row).toBeVisible()
    await expect(row.getByText('OPEN')).toBeVisible()

    const slots = await getSlotsForFaculty(faculty.id)
    expect(slots.some((slot) => slot.location === 'Room 202' && slot.status === 'OPEN')).toBe(true)
  })

  test('rejects an end time before the start time', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-avail-bad')

    await openAvailability(page, email)
    await page.getByRole('button', { name: 'Add Availability' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Date').fill(tomorrowIso())
    await dialog.getByLabel('Start').fill('10:00')
    await dialog.getByLabel('End').fill('09:00')
    await dialog.getByLabel('Location').fill('Room 203')
    await dialog.getByRole('button', { name: 'Add availability' }).click()

    await expect(dialog.getByRole('alert')).not.toBeEmpty()
    expect(await getSlotsForFaculty(faculty.id)).toHaveLength(0)
  })

  test('edits an open slot', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-avail-edit')
    await ensureSlot(faculty.id)

    await openAvailability(page, email)
    const row = page.getByRole('row').filter({ hasText: 'Room 101' })
    await row.getByRole('button', { name: 'Edit' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('End').fill('11:00')
    await dialog.getByLabel('Location').fill('Room 205')
    await dialog.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByRole('row').filter({ hasText: 'Room 205' })).toBeVisible()
    const slots = await getSlotsForFaculty(faculty.id)
    expect(slots.some((slot) => slot.end_time.startsWith('11:00'))).toBe(true)
  })

  test('removes an open slot after confirmation', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-avail-del')
    await ensureSlot(faculty.id)

    await openAvailability(page, email)
    const row = page.getByRole('row').filter({ hasText: 'Room 101' })
    await row.getByRole('button', { name: 'Remove' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remove' }).click()

    await expect(row).toHaveCount(0)
    await expect(page.getByText('No upcoming availability.')).toBeVisible()
    expect(await getSlotsForFaculty(faculty.id)).toHaveLength(0)
  })

  test('hides edit and remove for a reserved slot and shows details', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-avail-locked')
    await ensureSlot(faculty.id)
    const studentEmail = uniqueEmail('e2e-avail-locked-student')
    const student = await ensureAccount(studentEmail, password, 'E2E Locked Student')
    await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
    const slotId = (await getSlotsForFaculty(faculty.id))[0]!.id
    await bookConsultationAs(studentEmail, password, slotId)

    await openAvailability(page, email)
    const row = page.getByRole('row').filter({ hasText: 'Room 101' })
    await expect(row.getByText('RESERVED')).toBeVisible()
    await expect(row.getByRole('button', { name: 'Edit' })).toHaveCount(0)
    await expect(row.getByRole('button', { name: 'Remove' })).toHaveCount(0)

    await row.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('dialog').getByText('Availability details')).toBeVisible()
  })

  test('shows a view action for a booked slot', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-avail-booked')
    await ensureSlot(faculty.id)
    const studentEmail = uniqueEmail('e2e-avail-booked-student')
    const student = await ensureAccount(studentEmail, password, 'E2E Booked Student')
    await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
    const slotId = (await getSlotsForFaculty(faculty.id))[0]!.id
    const consultationId = await bookConsultationAs(studentEmail, password, slotId)
    await decideConsultationAs(email, password, consultationId, true)

    await openAvailability(page, email)
    const row = page.getByRole('row').filter({ hasText: 'Room 101' })
    await expect(row.getByText('Booked', { exact: true })).toBeVisible()
    await expect(row.getByRole('button', { name: 'Edit' })).toHaveCount(0)
    await expect(row.getByRole('button', { name: 'Remove' })).toHaveCount(0)

    await row.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('dialog').getByText('Availability details')).toBeVisible()
  })
})
