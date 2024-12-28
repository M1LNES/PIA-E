import { NextResponse } from 'next/server'
import { log } from '@/app/api/utils/logger'
import {
	getCommentsForUser,
	getTotalCommentsPublic,
} from '../../service/comment-service'
import { AppError } from '../../utils/errors'

/**
 * API Route: POST /api/public/comments
 *
 * This route handles a POST request to fetch all comments for a given user, grouped by post ID.
 * It expects an email as input and returns a dictionary of posts and the number of comments associated with each post.
 */
const route = '/api/public/comments'

/**
 * Handles the POST request to fetch the total number of comments for a specific user, grouped by post.
 *
 * @param {Request} request - The incoming request containing the email of the user.
 *
 * @returns {NextResponse} - A response containing the grouped comments data or an error message.
 */
export async function POST(request: Request) {
	try {
		// Parse the request body to extract the email
		const { email } = await request.json()

		const commentsByPost = await getCommentsForUser(email)
		// Log the successful retrieval of comments by post
		log(
			'info',
			`POST ${route}`,
			'Comments successfully fetched, the returned result',
			commentsByPost
		)

		// Return the transformed data with a 200 OK status
		return NextResponse.json(commentsByPost, { status: 200 })
	} catch (error) {
		// Log any errors that occur during the process
		if (error instanceof AppError) {
			log('warn', `POST ${route}`, error.description)
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode }
			)
		}

		// Log any errors encountered during the request
		log('error', `POST ${route}`, 'Failed to fetch  comments by post', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response in case of failure
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

/**
 * GET /api/public/comments
 * Fetches the total number of comments and returns it in the response.
 *
 * @returns {Response} - JSON response containing the total comments count.
 */
export async function GET() {
	try {
		log('debug', `GET ${route}`, 'Fetching total comments...')

		// Fetch the total number of comments from the database
		const totalComments = await getTotalCommentsPublic()

		// Log the successful fetch operation
		log('info', `GET ${route}`, 'Total comments successfully fetched', {
			totalComments,
		})

		// Return the total number of comments in JSON format with a 200 OK status
		return NextResponse.json({ totalComments }, { status: 200 })
	} catch (error) {
		// Log any errors that occur during the fetch operation
		log('error', `GET ${route}`, 'Failed to fetch total comments', {
			error: (error as Error).message,
		})

		// Return a 500 Internal Server Error response
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
