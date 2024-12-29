import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import { createNewComment } from '../service/comment-service'
import { AppError } from '../utils/errors'
import { CreateCommentRequest } from '@/dto/post-bodies'
import { CommentCreated, ErrorResponse } from '@/dto/types'

const route = 'POST /api/comments'

/**
 * Handles the addition of a new comment to a specified post.
 * This route ensures that only authenticated users with sufficient permissions can add comments.
 * It performs validation on the provided data and logs relevant information for tracking.
 *
 * @param {Request} request - The incoming request containing the comment details in JSON format.
 * @returns {Promise<NextResponse<ErrorResponse | CommentCreated>> } - JSON response
 */
export async function POST(
	request: Request
): Promise<NextResponse<ErrorResponse | CommentCreated>> {
	try {
		const body: CreateCommentRequest = await request.json()
		const { content, postId } = body

		const comment = await createNewComment(postId, content)
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
