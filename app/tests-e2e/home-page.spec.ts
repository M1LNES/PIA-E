/* This file tests that the posts are successfully rendered */
import { test, expect } from '@playwright/test'

/* Logging as a reader */
test.beforeEach(async ({ page }) => {
	await page.goto('http://localhost:3000/en')
	await page.getByRole('button', { name: 'Sign In' }).click()
	await page
		.getByPlaceholder('shahar@emplifi.io')
		.fill(process.env.TEST_USER_MAIL as string)
	await page
		.getByLabel('Password')
		.fill(process.env.TEST_USER_PASSWORD as string)
	await page.getByRole('button', { name: 'Sign in with Credentials' }).click()
})

test('Seing some posts - swaping to czech - seing the posts again', async ({
	page,
}) => {
	await expect(page.getByText('Show comments').first()).toBeVisible()

	await page.getByText('Show comments').first().click() // Loading comments
	await expect(page.getByText('Loading comments...')).toBeVisible()

	await page.getByRole('link', { name: 'CS' }).click() // Switching to Czech

	await expect(page.getByText('Zobrazit komentáře').first()).toBeVisible()

	await page.getByText('Zobrazit komentáře').first().click() // Loading comments
	await expect(page.getByText('Načítání komentářů...')).toBeVisible()
})
