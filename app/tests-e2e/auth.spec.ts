/* This file tests that the authentication works as expected */

import { test, expect } from '@playwright/test'

test('Login form while session is not active - English', async ({ page }) => {
	await page.goto('http://localhost:3000/en')

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle('Emplifi Wishlist')
	await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
	await expect(
		page.getByRole('heading', { name: 'Please log in to access this' })
	).toBeVisible()
	await expect(
		page.getByText(
			'To view this content, please log in with your Emplifi account.'
		)
	).toBeVisible()
	await expect(page.locator('#katman_1')).toBeVisible()
})

test('Login form while session is not active - Czech', async ({ page }) => {
	await page.goto('http://localhost:3000/cs')

	await expect(page).toHaveTitle('Emplifi Wishlist')
	await expect(page.getByRole('button', { name: 'Přihlásit se' })).toBeVisible()
	await expect(
		page.getByRole('heading', {
			name: 'Pro přístup k tomuto obsahu se prosím přihlaste',
		})
	).toBeVisible()
	await expect(
		page.getByText(
			'Pro zobrazení tohoto obsahu se prosím přihlaste pomocí svého účtu Emplifi.'
		)
	).toBeVisible()
	await expect(page.locator('#katman_1')).toBeVisible()
})

test('Login form while session is not active - language not set', async ({
	page,
}) => {
	await page.goto('http://localhost:3000')
	await expect(page).toHaveURL(/http:\/\/localhost:3000\/(cs|en)(\?.*)?/)
	await expect(page).toHaveTitle('Emplifi Wishlist')
})

test('Login in - invalid password', async ({ page }) => {
	await page.goto('http://localhost:3000/en')
	await page.getByRole('button', { name: 'Sign In' }).click()
	await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Sign in with Credentials' })
	).toBeVisible()
	await page.getByPlaceholder('shahar@emplifi.io').fill('user123@gmail.com')
	await page.getByLabel('Password').fill('invalid-paswwprd-gyat-skibid-sigma')
	await page.getByRole('button', { name: 'Sign in with Credentials' }).click()

	await expect(page.getByText('Sign in failed. Check the')).toBeVisible()
})

test('Login in - valid password', async ({ page }) => {
	await page.goto('http://localhost:3000/en')
	await page.getByRole('button', { name: 'Sign In' }).click()
	await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
	await expect(
		page.getByRole('button', { name: 'Sign in with Credentials' })
	).toBeVisible()
	await page
		.getByPlaceholder('shahar@emplifi.io')
		.fill(process.env.TEST_USER_MAIL as string)
	await page
		.getByLabel('Password')
		.fill(process.env.TEST_USER_PASSWORD as string)
	await page.getByRole('button', { name: 'Sign in with Credentials' }).click()

	await expect(page.locator('div').nth(1)).toBeVisible()
	await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible()
	await expect(page.locator('div').nth(1)).toBeHidden()
})
