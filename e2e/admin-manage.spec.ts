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
    await expect(page.getByRole('heading', { name: 'Needs attention' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Consultation activity' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Recent consultations' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quick actions' })).toBeVisible()

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
    const facultyRow = page.getByRole('row').filter({ hasText: name })
    await expect(facultyRow).toBeVisible()
    await expect(facultyRow).toHaveText(/Instructor I/)

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

    const grid = page.getByRole('region', { name: 'Existing departments' })
    await expect
      .poll(async () => {
        const values = await grid
          .locator('input[name="name"]')
          .evaluateAll((inputs) => (inputs as HTMLInputElement[]).map((input) => input.value))
        return values.includes(name)
      })
      .toBe(true)
    expect((await getDepartmentByCode(code))?.name).toBe(name)
    await expect(addForm.getByRole('status')).toHaveText('Department added.')
    await addForm.locator('input[name="code"]').fill(code)
    await addForm.locator('input[name="name"]').fill(name)
    await addForm.getByRole('button', { name: 'Add department' }).click()
    await expect(addForm.getByRole('alert')).toContainText('use a unique code and name')
    await expect(addForm.locator('input[name="name"]')).toHaveValue(name)
    let cardIndex = -1
    await expect
      .poll(
        async () => {
          const codes = await grid
            .locator('input[name="code"]')
            .evaluateAll((inputs) => (inputs as HTMLInputElement[]).map((input) => input.value))
          cardIndex = codes.indexOf(code)
          return cardIndex
        },
        { timeout: 30_000 }
      )
      .toBeGreaterThanOrEqual(0)
    const row = grid.getByRole('row').nth(cardIndex + 1)
    await row.locator('input[name="name"]').fill(renamed)
    await row.getByRole('button', { name: 'Save changes' }).click()
    await expect.poll(() => getDepartmentByCode(code).then((row) => row?.name)).toBe(renamed)
    await expect(row.getByRole('status')).toHaveText('Changes saved.')
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
    await bookConsultationAs(
      studentEmail,
      password,
      slot.id,
      'ACADEMIC',
      'Private export test note'
    )

    await signInAs(page, email, password)
    await page.goto('/admin/consultations')
    await expect(page.getByRole('columnheader', { name: 'Faculty' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Action' })).toHaveCount(0)
    await expect(page.getByText('Private export test note')).toHaveCount(0)
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
    expect(csv).not.toContain('Private export test note')
  })
  test('management pages keep filters and records within narrow and tablet viewports', async ({
    page,
  }) => {
    const { email } = await setupAdmin('e2e-adminresponsive')
    await signInAs(page, email, password)
    for (const route of ['/admin', '/admin/users', '/admin/departments', '/admin/consultations']) {
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        const dimensions = await page.evaluate(() => ({
          viewport: innerWidth,
          content: document.documentElement.scrollWidth,
        }))
        expect(dimensions.content, `${route} at ${width}px`).toBeLessThanOrEqual(
          dimensions.viewport
        )
        if (route === '/admin/users')
          await expect(page.getByRole('button', { name: 'Add Faculty', exact: true })).toBeVisible()
      }
    }
  })
})
