import { AppError } from '../utils/errors'
import {
	checkDuplicateCategory,
	createCategory,
	getAllCategories,
	getUserByEmail,
} from '../utils/queries'
import { validateSession } from './session-service'
import config from '@/app/config'

export async function getCategories() {
	// Validate session
	const session = await validateSession()

	const user = await getUserByEmail(session.user?.email as string)

	// Ensure user has sufficient permissions to fetch categories
	if (
		user.permission < config.pages.createPost.minPermission ||
		user.permission < config.pages.createCategory.minPermission
	) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`${session.user?.email} tried to fetch roles but did not have enough permissions`
		)
	}

	// Fetch and return all categories
	const categories = await getAllCategories()

	// Fetch and return roles
	return categories
}

export async function createNewCategory(title: string) {
	const session = await validateSession()

	// Validate presence of title field in request body
	if (!title) {
		throw new AppError(
			'Title field required',
			400,
			`${session.user?.email} passed empty title while creating category.`
		)
	}

	const user = await getUserByEmail(session.user?.email as string)

	// Check if user has sufficient permissions to create a category
	if (!user || user.permission < config.pages.createCategory.minPermission) {
		throw new AppError(
			'Not enough permissions!',
			403,
			`${session.user?.email} tried to create new category but did not have enough permissions`
		)
	}

	// Check for duplicate category title
	const existingCategory = await checkDuplicateCategory(title)

	if (existingCategory.length > 0) {
		throw new AppError(
			'Category with this title already exists!',
			409,
			`User ${session.user?.email} wanted to create category with already used name!`
		)
	}

	// Create the new category and log success
	const newCategory = await createCategory(title)
	return newCategory
}
