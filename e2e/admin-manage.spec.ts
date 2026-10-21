import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import {
  bookConsultationAs,
  ensureAccount,
  ensureFacultyProfile,
  ensureSlot,
  getDepartmentByCode,
  getDepartments,
  setDepartment,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'
import { signInAs } from './helpers/testSession'

const password = 'Password123!'

async function setupAdmin(prefix: string) {
  const email = uniqueEmail(`${prefix}-admin`)
  const admin = await ensureAccount(email, password, 'E2E Admin')
  await setProfile(admin.id, { role: 'ADMIN', account_status: 'APPROVED' })
  return { admin, email }
}

async function dashboardCounts(page: Page) {
  await page.goto('/admin')
  const valueFor = (label: string) =>
    page.locator('dt', { hasText: label }).locator('xpath=..').locator('dd')
  return {
    students: Number(await valueFor('Students').textContent()),
    faculty: Number(await valueFor('Faculty').textContent()),
    consultations: Number(await valueFor('Consultations').textContent()),
  }
}

test.describe('Admin management', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')
  test.setTimeout(180_000)

  test('dashboard counts move with the database', async ({ page }) => {
    const { email } = await setupAdmin('e2e-admindash')
    const departments = await getDepartments()

    await signInAs(page, email, password)
    const before = await dashboardCounts(page)

    const facultyEmail = uniqueEmail('e2e-admindash-faculty')
    const faculty = await ensureAccount(facultyEmail, password, 'E2E Dash Faculty')
    await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
    await ensureFacultyProfile(faculty.id, departments[0]!.id)
    const slot = await ensureSlot(faculty.id)
    const studentEmail = uniqueEmail('e2e-admindash-student')
    const student = await ensureAccount(studentEmail, password, 'E2E Dash Student')
    await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
    await bookConsultationAs(studentEmail, password, slot.id)

    const after = await dashboardCounts(page)
    expect(after.consultations).toBeGreaterThanOrEqual(before.consultations + 1)
    expect(after.faculty).toBeGreaterThanOrEqual(before.faculty + 1)
    expect(after.students).toBeGreaterThanOrEqual(before.students + 1)
  })

  test('faculty search narrows the directory', async ({ page }) => {
    const { email } = await setupAdmin('e2e-adminfac')
    const departments = await getDepartments()
    const facultyEmail = uniqueEmail('e2e-adminfac-faculty')
    const name = `E2E Searchable ${Date.now()}`
    const faculty = await ensureAccount(facultyEmail, password, name)
    await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
    await ensureFacultyProfile(faculty.id, departments[0]!.id)

    await signInAs(page, email, password)
    await page.goto('/admin/users?role=FACULTY')
    await expect(page.getByText('Status', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Approved', { exact: true })).toHaveCount(0)
    await page.getByRole('searchbox', { name: 'Search' }).fill(name)
    await expect(page.locator('article', { hasText: name }).first()).toBeVisible()
    await expect(page.locator('article', { hasText: name }).first()).toHaveText(/Instructor I/)

    await page.getByRole('searchbox', { name: 'Search' }).fill(`Nope${Date.now()}`)
    await expect(page.getByText('No accounts match these filters.')).toBeVisible()
  })

  test('departments can be added and renamed', async ({ page }) => {
    const { email } = await setupAdmin('e2e-admindept')
    const code = `E${Date.now().toString().slice(-8)}`
    const name = `E2E Department ${Date.now()}`
    const renamed = `${name} Renamed`

    await signInAs(page, email, password)
    await page.goto('/admin/departments')

    const addForm = page
      .getByRole('button', { name: 'Add department', exact: true })
      .locator('xpath=ancestor::form[1]')
    await addForm.locator('input[name="code"]').fill(code)
    await addForm.locator('input[name="name"]').fill(name)
    await addForm.getByRole('button', { name: 'Add department' }).click()
    await expect
      .poll(async () => {
        const values = await page
          .locator('article input[name="name"]')
          .evaluateAll((inputs) => (inputs as HTMLInputElement[]).map((input) => input.value))
        return values.includes(name)
      })
      .toBe(true)
    expect((await getDepartmentByCode(code))?.name).toBe(name)

    const grid = page.getByRole('region', { name: 'Existing departments' })
    let cardIndex = -1
    await expect
      .poll(
        async () => {
          const codes = await grid
            .locator('article input[name="code"]')
            .evaluateAll((inputs) => (inputs as HTMLInputElement[]).map((input) => input.value))
          cardIndex = codes.indexOf(code)
          return cardIndex
        },
        { timeout: 30_000 }
      )
      .toBeGreaterThanOrEqual(0)
    const card = grid.locator('article').nth(cardIndex)
    await card.locator('input[name="name"]').fill(renamed)
    await card.getByRole('button', { name: 'Save changes' }).click()
    await expect.poll(() => getDepartmentByCode(code).then((row) => row?.name)).toBe(renamed)
  })

  test('consultation records export a CSV covering the range', async ({ page }) => {
    const { email } = await setupAdmin('e2e-adminexp')
    const departments = await getDepartments()
    const facultyEmail = uniqueEmail('e2e-adminexp-faculty')
    const faculty = await ensureAccount(facultyEmail, password, 'E2E Export Faculty')
    await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
    await ensureFacultyProfile(faculty.id, departments[0]!.id)
    const studentEmail = uniqueEmail('e2e-adminexp-student')
    const student = await ensureAccount(studentEmail, password, 'E2E Export Student')
    await setProfile(student.id, { role: 'STUDENT', account_status: 'APPROVED' })
    await setDepartment(student.id, departments[0]!.id)
    const slot = await ensureSlot(faculty.id)
    await bookConsultationAs(studentEmail, password, slot.id)

    await signInAs(page, email, password)
    await page.goto('/admin/consultations')
    const today = new Date().toISOString().slice(0, 10)
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const exportForm = page.locator('form', { hasText: 'Download summary CSV' })
    await exportForm.getByLabel('From').fill(today)
    await exportForm.getByLabel('To').fill(nextWeek)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download summary CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('consultation-summary')
    const path = await download.path()
    const csv = readFileSync(path!, 'utf8')
    expect(csv).toContain('Date,Department,Category,Status,Count')
    expect(csv).toContain('PENDING')
  })
})
