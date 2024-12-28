import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	getAllCategories,
	checkDuplicateCategory,
	createCategory,
} from '@/app/api/utils/queries'
import { log } from '@/app/api/utils/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = '/api/categories'

/**
 * Handles HTTP GET and POST requests for the /api/categories endpoint.
 * - GET: Fetch all categories.
 * - POST: Create a new category.
 *
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} - JSON response with status and details of the operation.
 */
export async function GET() {
	// Retrieve session data and validate user authentication
	const session = await getServerSession()

	if (!session) {
		log('warn', `${route} - GET`, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		// Log debug information for permission check and data fetching
		log(
			'debug',
			`${route} - GET`,
			`Checking user permission (${session.user?.email}) and fetching all categories...`
		)

		const user = await getUserByEmail(session.user?.email as string)

		// Ensure user has sufficient permissions to fetch categories
		if (
			user.permission < config.pages.createPost.minPermission ||
			user.permission < config.pages.createCategory.minPermission
		) {
			log(
				'warn',
				`${route} - GET`,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Fetch and return all categories
		const categories = await getAllCategories()

		log(
			'info',
			`${route} - GET`,
			`Returning categories for user ${session.user?.email}`,
			{
				categories,
			}
		)

		return NextResponse.json({ categories }, { status: 200 })
	} catch (error) {
		// Log any errors encountered during data fetching
		log('error', `${route} - GET`, 'Failed to fetch categories', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

export async function POST(request: Request) {
	const body = await request.json()
	const { title } = body

	// Retrieve session data and validate user authorization
	const session = await getServerSession()

	if (!session) {
		log('warn', `${route} - POST`, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Validate presence of title field in request body
	if (!title) {
		log(
			'warn',
			`${route} - POST`,
			`${session.user?.email} passed empty title while creating category.`
		)
		return NextResponse.json(
			{
				error: 'Title field required',
			},
			{ status: 400 }
		)
	}

	try {
		// Log debug information for permission and duplication check
		log(
			'debug',
			`${route} - POST`,
			`Checking ${session.user?.email}'s permission, duplicates and creating category...`
		)

		const user = await getUserByEmail(session.user?.email as string)

		// Check if user has sufficient permissions to create a category
		if (!user || user.permission < config.pages.createCategory.minPermission) {
			log(
				'warn',
				`${route} - POST`,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Check for duplicate category title
		const existingCategory = await checkDuplicateCategory(title)

		if (existingCategory.length > 0) {
			log(
				'warn',
				`${route} - POST`,
				`User ${session.user?.email} wanted to create category with already used name!`,
				user
			)
			return NextResponse.json(
				{
					error: 'Category with this title already exists!',
				},
				{ status: 409 }
			)
		}

		// Create the new category and log success
		const newCategory = await createCategory(title)

		log(
			'info',
			`${route} - POST`,
			`${session.user?.email} successfully created new category.`,
			newCategory
		)

		return NextResponse.json(
			{
				message: 'Category created',
			},
			{ status: 201 }
		)
	} catch (error) {
		// Log any errors that occur during the process
		log('error', `${route} - POST`, 'Failure while adding category', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
