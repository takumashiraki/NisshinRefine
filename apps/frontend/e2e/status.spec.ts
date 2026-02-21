import { test, expect } from '@playwright/test'

test('status page shows title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'NisshinRefine' })).toBeVisible()
})
