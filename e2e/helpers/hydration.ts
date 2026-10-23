import type { Locator, Page } from '@playwright/test'

/**
 * Dev-server bundles can finish painting before React hydrates, and a click
 * during that window is lost. Waiting for React's internal props on the target
 * element (or any interactive element) proves the page is interactive.
 *
 * Table subtrees hydrate later than the shell, and React may replace the
 * server-rendered node, so re-resolve the locator on every poll.
 */
export async function waitForHydration(page: Page, target?: Locator): Promise<void> {
  if (target) {
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      const hydrated = await target
        .evaluate((element) => Object.keys(element).some((key) => key.startsWith('__reactProps$')))
        .catch(() => false)
      if (hydrated) return
      await page.waitForTimeout(100)
    }
    throw new Error('Element did not hydrate')
  }

  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('button, a, input, [role="button"]')).some((element) =>
      Object.keys(element).some((key) => key.startsWith('__reactProps$'))
    )
  )
}
