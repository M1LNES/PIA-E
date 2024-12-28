import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { createNewComment } from '../service/comment-service'
import { AppError } from '../utils/errors'

const route = 'POST /api/comments'

/**
 * Handles the addition of a new comment to a specified post.
 * This route ensures that only authenticated users with sufficient permissions can add comments.
 * It performs validation on the provided data and logs relevant information for tracking.
 *
 * @param {Request} request - The incoming request containing the comment details in JSON format.
 * @returns {Response} - JSON response with the new comment data, error, or status.
 */
export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { description, postId } = body

		const comment = await createNewComment(postId, description)
		// Log success and return the newly created comment
		log('info', route, `User created new comment!`, comment)

		return NextResponse.json(
			{
				message: 'Comment created',
				comment,
			},
			{ status: 201 }
		)
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
		log('error', route, 'Error occurred during adding new comment', {
			error: (error as Error).message,
		})

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}