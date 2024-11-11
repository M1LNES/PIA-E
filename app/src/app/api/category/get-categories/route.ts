import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { getAllCategories, getUserByEmail } from '../../queries'
import { log } from '@/app/api/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/category/get-categories'

/**
 * Handles fetching all categories.
 * Checks for user session and authorization, then retrieves all categories if permitted.
 * Logs the process and any errors encountered during execution.
 *
 * @returns {NextResponse} - JSON response containing categories or error details.
 */
export async function GET() {
	// Retrieve session data and validate user authentication
	const session = await getServerSession()

	if (!session) {
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	/* Authorization */
	try {
		// Log debug information for permission check and data fetching
		log(
			'debug',
			route,
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
				route,
				`User ${session.user?.email} tried to call endpoint, but did not have enough permissions!`,
				user
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 401 }
			)
		}

		// Fetch and return all categories
		const categories = await getAllCategories()

		log('info', route, `Returning categories for user ${session.user?.email}`, {
			categories,
		})

		return NextResponse.json({ categories }, { status: 200 })
	} catch (error) {
		// Log any errors encountered during data fetching
		log('error', route, 'Failed to fetch categories', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
