import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  bookConsultationAs,
  ensureAccount,
  ensureFacultyProfile,
  ensureSlot,
  getFirstDepartment,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'
import { waitForHydration } from './helpers/hydration'

const password = 'Password123!'

async function setupFaculty(prefix: string) {
  const department = await getFirstDepartment()
  const email = uniqueEmail(`${prefix}-faculty`)
  const faculty = await ensureAccount(email, password, `E2E Faculty ${Date.now()}`)
  await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
  await ensureFacultyProfile(faculty.id, department.id)
  return { faculty, email }
}

test.describe('Faculty dashboard', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  test.setTimeout(180_000)

  test('shows availability and approves a pending request', async ({ page }) => {
    const { faculty, email } = await setupFaculty('e2e-dash')
    const bookedSlot = await ensureSlot(faculty.id)
    await ensureSlot(faculty.id, { start_time: '11:00', end_time: '12:00' })
    const studentEmail = uniqueEmail('e2e-dash-student')
    const studentName = `E2E Dashboard Student ${Date.now()}`
    const student = await ensureAccount(studentEmail, password, studentName)
    await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
    const notes = 'Need help with enrollment.'
    await bookConsultationAs(studentEmail, password, bookedSlot.id, 'ACADEMIC', notes)

    await signInAs(page, email, password)
    await page.goto('/faculty')

    await expect(page.getByRole('region', { name: 'Availability status' })).toContainText(
      '1 open slot'
    )
    const pending = page.getByRole('listitem').filter({ hasText: studentName })
    await expect(pending).toBeVisible()
    const approveTrigger = pending.getByRole('button', {
      name: `Approve consultation with ${studentName}`,
    })
    await waitForHydration(page, approveTrigger)
    await approveTrigger.click()
    const approveDialog = page.getByRole('alertdialog')
    await waitForHydration(page, approveDialog.getByRole('button', { name: 'Approve' }))
    await approveDialog.getByRole('button', { name: 'Approve' }).click()

    await expect(page.getByText("You're all caught up.")).toBeVisible()
    const agenda = page.getByRole('listitem').filter({ hasText: studentName })
    const agendaDetails = agenda.getByRole('button', {
      name: `View consultation details with ${studentName}`,
    })
    await waitForHydration(page, agendaDetails)
    await agendaDetails.click()
    const dialog = page.getByRole('dialog', { name: 'Consultation details' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(studentName)
    await expect(dialog).toContainText(notes)
    await expect(page).toHaveURL(/\/faculty$/)
    await waitForHydration(page, dialog.getByRole('button', { name: 'Cancel' }))
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()

    await page.getByRole('link', { name: 'View all consultations' }).click()
    await expect(page).toHaveURL(/\/faculty\/consultations$/)
    const listDetails = page.getByRole('button', {
      name: `View consultation details with ${studentName}`,
    })
    await waitForHydration(page, listDetails)
    await listDetails.click()
    await expect(page.getByRole('dialog', { name: 'Consultation details' })).toBeVisible()
    await expect(page).toHaveURL(/\/faculty\/consultations$/)
    const listDialog = page.getByRole('dialog')
    await waitForHydration(page, listDialog.getByRole('button', { name: 'Cancel' }))
    await listDialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('shows guidance when there are no requests or open slots', async ({ page }) => {
    const { email } = await setupFaculty('e2e-dash-empty')

    await signInAs(page, email, password)
    await page.goto('/faculty')

    await expect(page.getByText('No open availability.')).toBeVisible()
    await expect(page.getByText("You're all caught up.")).toBeVisible()
    await expect(page.getByText('No confirmed consultations scheduled.')).toBeVisible()
  })
})
