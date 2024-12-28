import {
	getCommentsByPostId,
	getUserWithPermissions,
} from '@/app/api/utils/queries'
import config from '@/app/config'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'

export const revalidate = 1
export const fetchCache = 'force-no-store'

const route = 'GET /api/comments/:postId'

/**
 * Retrieves all comments for a specific post by its post ID.
 * Only accessible to users with sufficient permissions, and requires an authenticated session.
 * Performs validation checks and logs all relevant details.
 *
 * @param {Request} request - The incoming request object.
 * @param {Object} context - The context object containing route parameters.
 * @param {Promise<Object>} context.params - Promise resolving to the route parameters.
 * @param {string} context.params.postId - The ID of the post whose comments are being requested.
 * @returns {Response} - JSON response with the requested comments, or an error and corresponding status code.
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> }
) {
	// Extract postId from request parameters
	const postId = (await params).postId
	const session = await getServerSession()

	if (!session) {
		// Log unauthorized access attempt and respond with 401 error
		log('warn', route, 'Someone accessed without session.')
		return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 })
	}

	try {
		if (!postId) {
			// Log missing postId in the request and respond with 400 error
			log('warn', route, `User ${session.user?.email} did not specify postId`)
			return NextResponse.json(
				{ error: 'Post Id not specified' },
				{ status: 400 }
			)
		}

		/* Authorization */

		// Retrieve user with permission level and check if sufficient for access
		const user = await getUserWithPermissions(session.user?.email as string)
		if (user.permission < config.pages.home.minPermission) {
			log(
				'warn',
				route,
				`User ${session.user?.email} does not have permission to access this route!`
			)
			return NextResponse.json(
				{ error: 'Not enough permissions!' },
				{ status: 403 }
			)
		}

		// Fetch and return comments for the specified post ID
		const comments = await getCommentsByPostId(postId)
		log(
			'info',
			route,
			`Returning comments for user (${session.user?.email}) at post ${postId}:`,
			{ comments }
		)

		return NextResponse.json(comments, { status: 200 })
	} catch (error) {
		// Log internal server error details and respond with 500 error
		log('error', route, 'Error occurred during loading post comments.', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
