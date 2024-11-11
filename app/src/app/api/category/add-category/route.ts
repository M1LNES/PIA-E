import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
	getUserByEmail,
	checkDuplicateCategory,
	createCategory,
} from '@/app/api/queries'
import { log } from '@/app/api/logger'

const route = 'POST /api/category/add-category'

/**
 * Handles the creation of a new category.
 * Verifies session and permissions, checks for duplicate category titles,
 * and logs activity and any errors encountered during execution.
 *
 * @param {Request} request - The incoming request object.
 * @returns {NextResponse} - JSON response with status and details of the operation.
 */
export async function POST(request: Request) {
	const body = await request.json()
	const { title } = body

	// Retrieve session data and validate user authorization
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	// Validate presence of title field in request body
	if (!title) {
		log(
			'warn',
			route,
			`${session.user?.email} passed empty title while creating category.`
		)
		return NextResponse.json(
			{
				received: true,
				message: 'Title field required',
			},
			{ status: 400 }
		)
	}

	try {
		// Log debug information for permission and duplication check
		log(
			'debug',
			route,
			`Checking ${session.user?.email}'s permission, duplicates and creating category...`
		)

		const user = await getUserByEmail(session.user?.email as string)

		// Check if user has sufficient permissions to create a category
		if (!user || user.permission < config.pages.createCategory.minPermission) {
			log(
				'warn',
				route,
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
				route,
				`User ${session.user?.email} wanted to create category with already used name!`,
				user
			)
			return NextResponse.json(
				{
					message: 'Category with this title already exists!',
					status: 409,
				},
				{ status: 409 }
			)
		}

		// Create the new category and log success
		const newCategory = await createCategory(title)

		log(
			'info',
			route,
			`${session.user?.email} successfully created new category.`,
			newCategory
		)

		return NextResponse.json({
			received: true,
			status: 200,
			category: newCategory,
		})
	} catch (error) {
		// Log any errors that occur during the process
		log('error', route, 'Failure while adding category', {
			error: (error as Error).message,
		})
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
