import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { getPostCommentById } from '../../service/comment-service'
import { AppError } from '../../utils/errors'

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

	try {
		const postId = (await params).postId
		// Fetch and return comments for the specified post ID
		const comments = await getPostCommentById(postId)
		log('info', route, `Returning comments at post ${postId}:`, { comments })

		return NextResponse.json(comments, { status: 200 })
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `POST ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}
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
