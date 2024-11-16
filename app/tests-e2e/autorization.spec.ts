/* This file tests that the autorization works as expected */

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

test('Accessing "My account" - public to everyone', async ({ page }) => {
	await page.getByRole('link', { name: 'My account' }).click()
	await expect(page).toHaveTitle('Emplifi Wishlist')
})

test('Accessing "Create post" - not available to readers', async ({ page }) => {
	await page.goto('http://localhost:3000/en/create-post')
	await expect(
		page.getByText(`{
	"error": "Not enough permissions to access this page"
	}`)
	).toBeVisible
})

test('Accessing "Create category" - not available to readers', async ({
	page,
}) => {
	await page.goto('http://localhost:3000/en/create-category')
	await expect(
		page.getByText(`{
	"error": "Not enough permissions to access this page"
	}`)
	).toBeVisible
})

test('Accessing "Manage Users" - available only to admins and superadmin', async ({
	page,
}) => {
	await page.goto('http://localhost:3000/en/manage-users')
	await expect(
		page.getByText(`{
	"error": "Not enough permissions to access this page"
	}`)
	).toBeVisible
})
