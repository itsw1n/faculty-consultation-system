import { expect, test } from '@playwright/test'
import { databaseTestsEnabled } from './helpers/environment'
import { waitForHydration } from './helpers/hydration'
import { signInAs } from './helpers/testSession'
import {
  bookConsultationAs,
  decideConsultationAs,
  ensureAccount,
  ensureFacultyProfile,
  ensureSlot,
  getFirstDepartment,
  setProfile,
  uniqueEmail,
} from './helpers/testDatabase'

test.describe('Shared interaction polish', () => {
  test.skip(!databaseTestsEnabled(), 'needs local Supabase with a service-role key')

  test('mobile navigation dismisses with Escape, outside interaction, and navigation', async ({
    page,
  }) => {
    const account = await ensureAccount(
      uniqueEmail('e2e-polish-nav'),
      'Password123!',
      'E2E Student'
    )
    await signInAs(page, account.email, account.password)
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto('/student')
    const trigger = page.getByLabel('Open navigation')
    await waitForHydration(page, trigger)
    await trigger.click()
    const navigation = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(navigation).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(navigation).toBeHidden()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.mouse.click(310, 80)
    await expect(navigation).toBeHidden()
    await trigger.click()
    await navigation.getByRole('link', { name: 'My Consultations' }).click()
    await expect(page).toHaveURL('/student/consultations')
    await expect(navigation).toBeHidden()
  })

  test('a menu opened before hydration stays open when JavaScript arrives', async ({ page }) => {
    const account = await ensureAccount(
      uniqueEmail('e2e-polish-hydration'),
      'Password123!',
      'E2E Student'
    )
    await signInAs(page, account.email, account.password)
    await page.setViewportSize({ width: 390, height: 844 })
    let release!: () => void
    const scriptsReady = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route('**/*.js', async (route) => {
      await scriptsReady
      await route.continue()
    })
    try {
      await page.goto('/student', { waitUntil: 'domcontentloaded' })
      const trigger = page.getByLabel('Open navigation')
      await trigger.click()
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
      release()
      await page.waitForLoadState('networkidle')
      await waitForHydration(page, trigger)
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(trigger).toBeFocused()
    } finally {
      release()
    }
  })

  test('failed directory requests show safe feedback and recover on retry', async ({ page }) => {
    const account = await ensureAccount(
      uniqueEmail('e2e-polish-retry'),
      'Password123!',
      'E2E Student'
    )
    await signInAs(page, account.email, account.password)
    await page.goto('/student/consultations')
    await waitForHydration(page, page.getByRole('searchbox'))
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/student/consultations', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal server details' })
        : route.continue()
    )
    await page.getByRole('searchbox').fill('nobody')
    const feedback = page.getByText(
      'Unable to update results. Your previous results are still shown.',
      { exact: true }
    )
    await expect(feedback).toBeVisible()
    await expect(page.getByText('Internal server details')).toHaveCount(0)
    await page.unroute('**/student/consultations')
    await page.getByRole('button', { name: 'Try again', exact: true }).click()
    await expect(feedback).toHaveCount(0)
    await expect(page.getByText('No consultations found.', { exact: true })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('long consultation confirmations fit short narrow screens and restore focus', async ({
    page,
  }) => {
    const faculty = await ensureAccount(
      uniqueEmail('e2e-polish-faculty'),
      'Password123!',
      'E2E Faculty With A Long Name'
    )
    const student = await ensureAccount(
      uniqueEmail('e2e-polish-student'),
      'Password123!',
      'E2E Student With A Long Name'
    )
    await setProfile(faculty.id, { role: 'FACULTY', account_status: 'APPROVED' })
    await ensureFacultyProfile(faculty.id, (await getFirstDepartment()).id)
    const slot = await ensureSlot(faculty.id)
    const id = await bookConsultationAs(student.email, student.password, slot.id)
    await decideConsultationAs(faculty.email, faculty.password, id, true)
    await signInAs(page, faculty.email, faculty.password)
    await page.setViewportSize({ width: 320, height: 480 })
    await page.goto('/faculty/consultations')
    const trigger = page.getByRole('button', { name: /View consultation details with/ }).first()
    await waitForHydration(page, trigger)
    await trigger.click()
    await page.getByLabel('Outcome Note').fill('A long outcome note. '.repeat(80))
    await page.getByRole('button', { name: 'Mark as Completed', exact: true }).click()
    const dialog = page.getByRole('alertdialog')
    const submit = dialog.getByRole('button', { name: 'Mark as Completed', exact: true })
    await submit.scrollIntoViewIfNeeded()
    await expect(submit).toBeInViewport()
    const dimensions = await dialog.evaluate((element) => ({
      width: element.clientWidth,
      content: element.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.width)
    await submit.focus()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})
